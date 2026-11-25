"""Append Artifact Tool sheets without rewriting historical worksheets.

This module only packages authored OOXML parts. The new sheet contents, styles,
tables, validation rules, formulas and cached values come from Artifact Tool.
Every existing worksheet, worksheet relationship and table payload is retained.
"""
from copy import deepcopy
from hashlib import sha256
import json
from pathlib import Path
import posixpath
import re
from sys import argv
from xml.etree import ElementTree as ET
from zipfile import ZipFile, ZIP_DEFLATED

M = "{http://schemas.openxmlformats.org/spreadsheetml/2006/main}"
R = "{http://schemas.openxmlformats.org/officeDocument/2006/relationships}"
P = "{http://schemas.openxmlformats.org/package/2006/relationships}"
C = "{http://schemas.openxmlformats.org/package/2006/content-types}"
V = "{http://schemas.openxmlformats.org/officeDocument/2006/docPropsVTypes}"
A = "{http://schemas.openxmlformats.org/officeDocument/2006/extended-properties}"
ET.register_namespace("x", M[1:-1])
ET.register_namespace("r", R[1:-1])


def xml(element):
    for namespace in (P, C, A):
        if element.tag.startswith(namespace):
            ET.register_namespace("", namespace[1:-1])
    return ET.tostring(element, encoding="utf-8", xml_declaration=True)


def resolved(base, target):
    return target.lstrip("/") if target.startswith("/") else posixpath.normpath(posixpath.join(posixpath.dirname(base), target))


def append_styles(old, new):
    formats = old.find(M + "numFmts")
    if formats is None:
        formats = ET.Element(M + "numFmts")
        old.insert(0, formats)
    known = {f.get("formatCode"): int(f.get("numFmtId")) for f in formats}
    num_map = {}
    for item in new.findall(f"{M}numFmts/{M}numFmt"):
        code = item.get("formatCode")
        if code not in known:
            known[code] = max([163, *known.values()]) + 1
            added = deepcopy(item)
            added.set("numFmtId", str(known[code]))
            formats.append(added)
        num_map[int(item.get("numFmtId"))] = known[code]
    formats.set("count", str(len(formats)))
    offsets = {}
    for group in ("fonts", "fills", "borders", "cellStyleXfs", "cellXfs", "dxfs"):
        source = new.find(M + group)
        target = old.find(M + group)
        if target is None:
            target = ET.SubElement(old, M + group)
        offsets[group] = len(target)
        if source is not None:
            for child in source:
                item = deepcopy(child)
                if group in ("cellStyleXfs", "cellXfs"):
                    for attribute, referenced_group in (("fontId", "fonts"), ("fillId", "fills"), ("borderId", "borders"), ("xfId", "cellStyleXfs")):
                        if attribute in item.attrib:
                            item.set(attribute, str(int(item.get(attribute)) + offsets[referenced_group]))
                    number = int(item.get("numFmtId", "0"))
                    if number in num_map:
                        item.set("numFmtId", str(num_map[number]))
                target.append(item)
        target.set("count", str(len(target)))
    return offsets


def update_app_properties(parts, added_names):
    name = "docProps/app.xml"
    if name not in parts:
        return
    app = ET.fromstring(parts[name])
    titles = app.find(f"{A}TitlesOfParts/{V}vector")
    heading = app.find(f"{A}HeadingPairs/{V}vector")
    if titles is not None:
        for sheet_name in added_names:
            ET.SubElement(titles, V + "lpstr").text = sheet_name
        titles.set("size", str(len(titles)))
    if heading is not None:
        variants = list(heading)
        for index, variant in enumerate(variants[:-1]):
            label = variant.find(V + "lpstr")
            count = variants[index + 1].find(V + "i4")
            if label is not None and label.text in ("Worksheets", "Feuilles de calcul") and count is not None:
                count.text = str(int(count.text) + len(added_names))
    parts[name] = xml(app)


def append_workbook(baseline, edition, output, report_path, expected_sheet_count=34,
                    opening_sheet="Production V5", relationship_prefix="rProductionV5"):
    with ZipFile(baseline) as old, ZipFile(edition) as new:
        original = {name: old.read(name) for name in old.namelist()}
        parts = dict(original)
        old_book = ET.fromstring(parts["xl/workbook.xml"])
        old_sheets = old_book.find(M + "sheets")
        original_names = [s.get("name") for s in old_sheets]
        if len(original_names) != expected_sheet_count:
            raise ValueError(f"{expected_sheet_count} feuilles historiques attendues, trouvé {len(original_names)}")
        styles = ET.fromstring(parts["xl/styles.xml"])
        offsets = append_styles(styles, ET.fromstring(new.read("xl/styles.xml")))
        parts["xl/styles.xml"] = xml(styles)
        strings = ET.fromstring(parts.get("xl/sharedStrings.xml", b'<sst xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"/>'))
        additional = ET.fromstring(new.read("xl/sharedStrings.xml")) if "xl/sharedStrings.xml" in new.namelist() else ET.Element(M + "sst")
        string_offset = len(strings)
        total = int(strings.get("count", len(strings))) + int(additional.get("count", len(additional)))
        strings.extend(additional)
        strings.set("count", str(total))
        strings.set("uniqueCount", str(len(strings)))
        parts["xl/sharedStrings.xml"] = xml(strings)
        relationships = ET.fromstring(parts["xl/_rels/workbook.xml.rels"])
        content_types = ET.fromstring(parts["[Content_Types].xml"])
        new_book = ET.fromstring(new.read("xl/workbook.xml"))
        new_sheets = new_book.find(M + "sheets")
        new_targets = {r.get("Id"): r.get("Target") for r in ET.fromstring(new.read("xl/_rels/workbook.xml.rels"))}
        next_sheet = max(int(s.get("sheetId")) for s in old_sheets) + 1
        tables = [ET.fromstring(data) for name, data in parts.items() if re.fullmatch(r"xl/tables/table\d+\.xml", name)]
        next_table = max([0, *(int(t.get("id")) for t in tables)]) + 1
        table_names = {t.get("displayName") for t in tables}
        rel_ids = {r.get("Id") for r in relationships}
        added_names = []
        new_sheet_parts = []
        content_prefix = "application/vnd.openxmlformats-officedocument.spreadsheetml."
        for index, incoming in enumerate(new_sheets):
            sheet_name = incoming.get("name")
            if sheet_name in original_names or sheet_name in added_names:
                raise ValueError("Nom d’onglet en double : " + sheet_name)
            source = resolved("xl/workbook.xml", new_targets[incoming.get(R + "id")])
            sheet = ET.fromstring(new.read(source))
            for cell in sheet.iter(M + "c"):
                if "s" in cell.attrib:
                    cell.set("s", str(int(cell.get("s")) + offsets["cellXfs"]))
                if cell.get("t") == "s":
                    cell.find(M + "v").text = str(int(cell.find(M + "v").text) + string_offset)
            for tag, attr, group in (("row", "s", "cellXfs"), ("col", "style", "cellXfs"), ("cfRule", "dxfId", "dxfs")):
                for item in sheet.iter(M + tag):
                    if attr in item.attrib:
                        item.set(attr, str(int(item.get(attr)) + offsets[group]))
            sheet_id = next_sheet + index
            destination = f"xl/worksheets/sheet{sheet_id}.xml"
            if destination in parts:
                raise ValueError("Partie existante non remplaçable : " + destination)
            parts[destination] = xml(sheet)
            new_sheet_parts.append(destination)
            ET.SubElement(content_types, C + "Override", PartName="/" + destination, ContentType=content_prefix + "worksheet+xml")
            rel_id = relationship_prefix + str(index + 1)
            if rel_id in rel_ids:
                raise ValueError("Relation en double : " + rel_id)
            ET.SubElement(relationships, P + "Relationship", Id=rel_id, Type=R[1:-1] + "/worksheet", Target="/" + destination)
            heading = deepcopy(incoming)
            heading.set("sheetId", str(sheet_id))
            heading.set(R + "id", rel_id)
            old_sheets.append(heading)
            added_names.append(sheet_name)
            sheet_rels = posixpath.join(posixpath.dirname(source), "_rels", posixpath.basename(source) + ".rels")
            if sheet_rels in new.namelist():
                links = ET.fromstring(new.read(sheet_rels))
                for link in links:
                    if not link.get("Type").endswith("/table"):
                        raise ValueError("Ressource additionnelle non prévue : " + link.get("Type"))
                    table = ET.fromstring(new.read(resolved(source, link.get("Target"))))
                    if table.get("displayName") in table_names:
                        raise ValueError("Nom de tableau en double : " + table.get("displayName"))
                    table_names.add(table.get("displayName"))
                    table.set("id", str(next_table))
                    target = f"xl/tables/table{next_table}.xml"
                    next_table += 1
                    link.set("Target", "/" + target)
                    parts[target] = xml(table)
                    ET.SubElement(content_types, C + "Override", PartName="/" + target, ContentType=content_prefix + "table+xml")
                parts[f"xl/worksheets/_rels/sheet{sheet_id}.xml.rels"] = xml(links)
        new_names = new_book.find(M + "definedNames")
        if new_names is not None and len(new_names):
            raise ValueError("Les nouveaux onglets ne doivent pas nécessiter de noms définis implicites.")
        # Opening the current edition is a workbook-level navigation choice;
        # no historical worksheet view or other worksheet XML is rewritten.
        opening_index = len(original_names) + added_names.index(opening_sheet)
        views = old_book.find(M + "bookViews")
        if views is None:
            views = ET.Element(M + "bookViews")
            old_book.insert(list(old_book).index(old_sheets), views)
        if not len(views):
            ET.SubElement(views, M + "workbookView")
        for view in views:
            view.set("activeTab", str(opening_index))
            view.set("firstSheet", str(opening_index))
        parts["xl/workbook.xml"] = xml(old_book)
        parts["xl/_rels/workbook.xml.rels"] = xml(relationships)
        parts["[Content_Types].xml"] = xml(content_types)
        update_app_properties(parts, added_names)
        mutable_parts = {"xl/styles.xml", "xl/sharedStrings.xml", "xl/workbook.xml", "xl/_rels/workbook.xml.rels", "[Content_Types].xml", "docProps/app.xml"}
        preserved = [name for name in original if name not in mutable_parts]
        changed = [name for name in preserved if original[name] != parts.get(name)]
        if changed:
            raise ValueError("Composants historiques modifiés : " + ", ".join(changed))
        formula_counts = {}
        for sheet_name, source in zip(added_names, new_sheet_parts):
            sheet = ET.fromstring(parts[source])
            errors = [cell.get("r") for cell in sheet.iter(M + "c") if cell.get("t") == "e"]
            if errors:
                raise ValueError(f"Erreurs de formule dans {sheet_name} : {errors}")
            formula_counts[sheet_name] = len(list(sheet.iter(M + "f")))
        output.parent.mkdir(parents=True, exist_ok=True)
        with ZipFile(output, "w", compression=ZIP_DEFLATED, compresslevel=6) as result:
            for name, payload in parts.items():
                result.writestr(name, payload)
    with ZipFile(output) as result:
        if result.testzip() is not None:
            raise ValueError("Archive OOXML corrompue")
        for name in result.namelist():
            if name.endswith((".xml", ".rels")):
                ET.fromstring(result.read(name))
        for name in preserved:
            assert result.read(name) == original[name], name
    report = {
        "baseline": str(baseline),
        "baselineSha256": sha256(baseline.read_bytes()).hexdigest(),
        "output": str(output),
        "outputSha256": sha256(output.read_bytes()).hexdigest(),
        "originalSheetCount": len(original_names),
        "originalSheetOrder": original_names,
        "addedSheets": added_names,
        "finalSheetCount": len(original_names) + len(added_names),
        "openingSheet": opening_sheet,
        "openingSheetIndex": opening_index,
        "preservedOriginalParts": len(preserved),
        "preservedWorksheetXmlParts": sum(bool(re.fullmatch(r"xl/worksheets/sheet\d+\.xml", name)) for name in preserved),
        "preservedWorksheetSha256": {name: sha256(original[name]).hexdigest() for name in preserved
                                     if re.fullmatch(r"xl/worksheets/sheet\d+\.xml", name)},
        "preservedTableXmlParts": sum(bool(re.fullmatch(r"xl/tables/table\d+\.xml", name)) for name in preserved),
        "originalPartsChangedUnexpectedly": changed,
        "formulasInAddedSheets": formula_counts,
        "newFormulaErrorCells": 0,
        "zipAndXmlValidation": "passed",
        "nativeExcelRecalculation": "not_run",
        "preservationMethod": "Original OOXML parts retained byte for byte except append-only package manifests, shared strings and styles.",
    }
    report_path.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({"output": str(output), "sheets": report["finalSheetCount"], "preservedSheets": report["preservedWorksheetXmlParts"]}, ensure_ascii=False))


if __name__ == "__main__":
    if len(argv) not in (5, 8):
        raise SystemExit("Usage: append-production-workbook.py baseline.xlsx additions.xlsx output.xlsx packaging-report.json [expected-sheet-count opening-sheet relationship-prefix]")
    options = (int(argv[5]), argv[6], argv[7]) if len(argv) == 8 else ()
    append_workbook(*map(Path, argv[1:5]), *options)
