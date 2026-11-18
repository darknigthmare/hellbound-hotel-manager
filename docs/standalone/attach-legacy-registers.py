"""Package new Artifact Tool worksheets alongside the original V1 Excel registers.

V1 sheet XML, table definitions and cached formulas are copied byte for byte.
Only references from the new sheets are remapped into the shared Excel tables.
Both input workbooks are produced by this project's Artifact Tool builders.
"""
import posixpath
import re
from copy import deepcopy
from pathlib import Path
from sys import argv
from xml.etree import ElementTree as ET
from zipfile import ZipFile, ZIP_DEFLATED

M = "{http://schemas.openxmlformats.org/spreadsheetml/2006/main}"
R = "{http://schemas.openxmlformats.org/officeDocument/2006/relationships}"
P = "{http://schemas.openxmlformats.org/package/2006/relationships}"
C = "{http://schemas.openxmlformats.org/package/2006/content-types}"
ET.register_namespace("x", M[1:-1])
ET.register_namespace("r", R[1:-1])


def xml(element):
    # OPC readers expect the default namespace on package metadata parts.
    for namespace in (P, C):
        if element.tag.startswith(namespace):
            ET.register_namespace("", namespace[1:-1])
    return ET.tostring(element, encoding="utf-8", xml_declaration=True)


def combine_styles(old, new):
    old_formats = old.find(M + "numFmts")
    if old_formats is None:
        old_formats = ET.Element(M + "numFmts")
        old.insert(0, old_formats)
    formats = {f.get("formatCode"): int(f.get("numFmtId")) for f in old_formats}
    remap = {}
    for fmt in new.findall(f"{M}numFmts/{M}numFmt"):
        code = fmt.get("formatCode")
        if code not in formats:
            formats[code] = max([163, *formats.values()]) + 1
            item = deepcopy(fmt)
            item.set("numFmtId", str(formats[code]))
            old_formats.append(item)
        remap[int(fmt.get("numFmtId"))] = formats[code]
    old_formats.set("count", str(len(old_formats)))
    offsets = {}
    for group in ("fonts", "fills", "borders", "cellStyleXfs", "cellXfs", "dxfs"):
        incoming = new.find(M + group)
        existing = old.find(M + group)
        if incoming is None:
            continue
        if existing is None:
            existing = ET.SubElement(old, M + group)
        offsets[group] = len(existing)
        for item in incoming:
            item = deepcopy(item)
            if group in ("cellStyleXfs", "cellXfs"):
                for attr, key in (("fontId", "fonts"), ("fillId", "fills"), ("borderId", "borders"), ("xfId", "cellStyleXfs")):
                    if item.get(attr) is not None:
                        item.set(attr, str(int(item.get(attr)) + offsets[key]))
                fmt = int(item.get("numFmtId", "0"))
                if fmt in remap:
                    item.set("numFmtId", str(remap[fmt]))
            existing.append(item)
        existing.set("count", str(len(existing)))
    return offsets


def combine(baseline, edition, output):
    with ZipFile(baseline) as old, ZipFile(edition) as new:
        parts = {name: old.read(name) for name in old.namelist()}
        styles = ET.fromstring(parts["xl/styles.xml"])
        offsets = combine_styles(styles, ET.fromstring(new.read("xl/styles.xml")))
        parts["xl/styles.xml"] = xml(styles)
        strings = ET.fromstring(parts["xl/sharedStrings.xml"])
        additional = ET.fromstring(new.read("xl/sharedStrings.xml"))
        string_offset = len(strings)
        total = int(strings.get("count", len(strings))) + int(additional.get("count", len(additional)))
        strings.extend(additional)
        strings.set("count", str(total))
        strings.set("uniqueCount", str(len(strings)))
        parts["xl/sharedStrings.xml"] = xml(strings)

        book = ET.fromstring(parts["xl/workbook.xml"])
        relationships = ET.fromstring(parts["xl/_rels/workbook.xml.rels"])
        types = ET.fromstring(parts["[Content_Types].xml"])
        sheets = book.find(M + "sheets")
        n_sheets = max(int(s.get("sheetId")) for s in sheets)
        n_tables = max([0, *(int(m[1]) for name in parts if (m := re.fullmatch(r"xl/tables/table(\d+)\.xml",name)))])
        new_sheets = ET.fromstring(new.read("xl/workbook.xml")).find(M + "sheets")
        targets = {link.get("Id"): link.get("Target") for link in ET.fromstring(new.read("xl/_rels/workbook.xml.rels"))}
        known_names = {sheet.get("name") for sheet in sheets}
        for index, incoming in enumerate(new_sheets, 1):
            if incoming.get("name") in known_names:
                raise ValueError("Nom d’onglet en double " + incoming.get("name"))
            original = targets[incoming.get(R+"id")]
            original = original.lstrip("/") if original.startswith("/") else posixpath.normpath(posixpath.join("xl",original))
            sheet = ET.fromstring(new.read(original))
            for cell in sheet.iter(M+"c"):
                if cell.get("s"):
                    cell.set("s", str(int(cell.get("s")) + offsets["cellXfs"]))
                if cell.get("t") == "s":
                    val = cell.find(M+"v")
                    val.text = str(int(val.text) + string_offset)
            for tag, field in (("row","s"), ("col","style"), ("cfRule","dxfId")):
                for item in sheet.iter(M+tag):
                    if item.get(field):
                        key = "dxfs" if tag == "cfRule" else "cellXfs"
                        item.set(field, str(int(item.get(field)) + offsets[key]))
            sheet_id = index + n_sheets
            filename = f"xl/worksheets/sheet{sheet_id}.xml"
            parts[filename] = xml(sheet)
            content_type = "application/vnd.openxmlformats-officedocument.spreadsheetml."
            ET.SubElement(types,C+"Override",PartName="/"+filename,ContentType=content_type+"worksheet+xml")
            rel_id = "rProdBible" + str(index)
            ET.SubElement(relationships,P+"Relationship",Id=rel_id,Type=R[1:-1]+"/worksheet",Target="/"+filename)
            header = deepcopy(incoming)
            header.set("sheetId",str(sheet_id))
            header.set(R+"id",rel_id)
            sheets.insert(index-1,header)
            sheetrels = f"xl/worksheets/_rels/{posixpath.basename(original)}.rels"
            if sheetrels in new.namelist():
                links = ET.fromstring(new.read(sheetrels))
                for link in links:
                    if not link.get("Type").endswith("/table"):
                        raise ValueError("Type de ressource annexe inattendu : "+link.get("Type"))
                    t = link.get("Target")
                    t = t.lstrip("/") if t.startswith("/") else posixpath.normpath(posixpath.join(posixpath.dirname(original),t))
                    table = ET.fromstring(new.read(t))
                    table_id = n_tables + int(table.get("id"))
                    table.set("id",str(table_id))
                    target = f"xl/tables/table{table_id}.xml"
                    link.set("Target","/"+target)
                    parts[target] = xml(table)
                    ET.SubElement(types,C+"Override",PartName="/"+target,ContentType=content_type+"table+xml")
                parts[f"xl/worksheets/_rels/sheet{sheet_id}.xml.rels"]=xml(links)
        parts["xl/workbook.xml"]=xml(book)
        parts["xl/_rels/workbook.xml.rels"]=xml(relationships)
        parts["[Content_Types].xml"]=xml(types)
        with ZipFile(output,"w",compression=ZIP_DEFLATED,compresslevel=6) as result:
            for name,content in parts.items():
                result.writestr(name,content)


if __name__ == "__main__":
    combine(*map(Path,argv[1:]))
