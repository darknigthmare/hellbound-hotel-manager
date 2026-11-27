"""Read-only OOXML comparison of the final V17 bible against published V16.

This verifier does not author spreadsheets. It writes only its JSON QA report.
Run after Artifact Tool has exported, recalculated and reimported the workbook.
"""
import datetime
import argparse
import hashlib
import json
import re
from pathlib import Path
from xml.etree import ElementTree as ET
from zipfile import ZipFile

ROOT = Path(__file__).resolve().parents[3]
HERE = Path(__file__).resolve().parent
BASE = ROOT / 'docs/standalone/INFERNAL_VERSUS_BIBLE_V16.xlsx'
OUTPUT = ROOT / 'docs/standalone/INFERNAL_VERSUS_BIBLE_V17.xlsx'
M = '{http://schemas.openxmlformats.org/spreadsheetml/2006/main}'
MUTABLE = {'xl/styles.xml', 'xl/sharedStrings.xml', 'xl/workbook.xml',
           'xl/_rels/workbook.xml.rels', '[Content_Types].xml', 'docProps/app.xml'}


def sha(data):
    return hashlib.sha256(data).hexdigest()


def structure(element):
    if element is None:
        return None
    return (element.tag, tuple(sorted(element.attrib.items())), element.text,
            tuple(structure(child) for child in element))


assert sha(BASE.read_bytes()) == '5a4c82a521c4bfb90bf91485a2c531e0cb047ded7d8535e0f798cd0ad109c704'
register = json.loads((HERE / 'delivery-register.json').read_text())
assert register['status'] == 'final_production_register'
with ZipFile(BASE) as before, ZipFile(OUTPUT) as after:
    assert after.testzip() is None, 'Corrupt ZIP member.'
    for name in after.namelist():
        if name.endswith(('.xml', '.rels')):
            ET.fromstring(after.read(name))
    frozen = [name for name in before.namelist() if name not in MUTABLE]
    changed = [name for name in frozen if before.read(name) != after.read(name)]
    assert not changed, changed
    worksheets = [name for name in frozen if re.fullmatch(r'xl/worksheets/sheet\d+\.xml', name)]
    relationships = [name for name in frozen if re.fullmatch(r'xl/worksheets/_rels/sheet\d+\.xml\.rels', name)]
    tables = [name for name in frozen if re.fullmatch(r'xl/tables/table\d+\.xml', name)]
    assert len(worksheets) == 70 and len(tables) == 79
    old_book, new_book = [ET.fromstring(archive.read('xl/workbook.xml')) for archive in (before, after)]
    old_sheets, new_sheets = [book.find(M + 'sheets') for book in (old_book, new_book)]
    assert len(new_sheets) == 72
    assert [structure(sheet) for sheet in old_sheets] == [structure(sheet) for sheet in list(new_sheets)[:70]]
    assert [sheet.get('name') for sheet in list(new_sheets)[70:]] == ['Production V17', 'Cibles V17']
    assert structure(old_book.find(M + 'definedNames')) == structure(new_book.find(M + 'definedNames'))
    old_strings, new_strings = [ET.fromstring(archive.read('xl/sharedStrings.xml')) for archive in (before, after)]
    assert [structure(item) for item in old_strings] == [structure(item) for item in list(new_strings)[:len(old_strings)]]
    old_styles, new_styles = [ET.fromstring(archive.read('xl/styles.xml')) for archive in (before, after)]
    style_groups = {}
    for group in old_styles:
        retained = new_styles.find(group.tag)
        assert retained is not None, group.tag
        assert [structure(item) for item in group] == [structure(item) for item in list(retained)[:len(group)]], group.tag
        assert {k: v for k, v in group.attrib.items() if k != 'count'} == {k: v for k, v in retained.attrib.items() if k != 'count'}, group.tag
        style_groups[group.tag.removeprefix(M)] = len(group)
    all_tables = [ET.fromstring(after.read(name)) for name in after.namelist() if re.fullmatch(r'xl/tables/table\d+\.xml', name)]
    assert len(all_tables) == len({table.get('id') for table in all_tables}) == len({table.get('displayName') for table in all_tables}) == 81
    formula_rows, formula_errors = [], []
    style_count = len(new_styles.find(M + 'cellXfs'))
    for part in [f'xl/worksheets/sheet{index}.xml' for index in range(71, 73)]:
        sheet = ET.fromstring(after.read(part))
        for cell in sheet.iter(M + 'c'):
            if 's' in cell.attrib:
                assert int(cell.get('s')) < style_count
            value = cell.find(M + 'v')
            if cell.get('t') == 's':
                assert value is not None and int(value.text) < len(new_strings)
            if cell.get('t') == 'e':
                formula_errors.append({'part': part, 'cell': cell.get('r'), 'value': value.text})
            formula = cell.find(M + 'f')
            if formula is not None:
                formula_rows.append({'part': part, 'cell': cell.get('r'), 'formula': formula.text, 'cachedValue': value.text if value is not None else None})
    assert not formula_errors
    counts = register['counts']
    expected = {'B6': counts['distinctDrawings'], 'B7': counts['newDrawings'], 'B8': counts['revisedDrawings'],
                'B9': counts['deliveredImageFiles'], 'B10': counts['newStandaloneBases'], 'B12': register['cumulativeCounts']['standaloneBases']}
    assert len(formula_rows) == 6
    assert {row['cell']: float(row['cachedValue']) for row in formula_rows} == expected
    strings_text = [''.join(item.itertext()) for item in new_strings]
    delivery_sheet = ET.fromstring(after.read('xl/worksheets/sheet71.xml'))
    delivery_cells = {}
    for cell in delivery_sheet.iter(M + 'c'):
        value = cell.find(M + 'v')
        if value is not None:
            delivery_cells[cell.get('r')] = strings_text[int(value.text)] if cell.get('t') == 's' else value.text
    assert len(register['assets']) >= 1
    for row, asset in enumerate(register['assets'], 30):
        assert asset['addsStandaloneBase'] is False and asset['frameCoverage'] == 'full_object' and asset['kind'] == 'prop'
        assert delivery_cells[f'A{row}'] == asset['name'] + '\n' + asset['id']
        assert delivery_cells[f'B{row}'] == asset['category']
        assert float(delivery_cells[f'C{row}']) == 2 + bool(asset.get('thumbnail'))
        assert float(delivery_cells[f'D{row}']) == 0
    assert float(delivery_cells['B12']) == 115
    assert float(delivery_cells['B16']) == 145 + len(register['assets'])
    report = {
        'edition': 'V17', 'status': 'passed', 'checkedAt': datetime.datetime.now(datetime.timezone.utc).isoformat(),
        'baseline': str(BASE.relative_to(ROOT)), 'baselineSha256': sha(BASE.read_bytes()),
        'output': str(OUTPUT.relative_to(ROOT)), 'outputSha256': sha(OUTPUT.read_bytes()), 'outputBytes': OUTPUT.stat().st_size,
        'finalSheets': 72, 'finalTables': 81, 'historicalWorksheetParts': len(worksheets),
        'historicalWorksheetRelationshipParts': len(relationships), 'historicalTableParts': len(tables),
        'historicalWorksheetRelationshipAndTablePayloadsPreservedByteForByte': len(worksheets) + len(relationships) + len(tables),
        'allFrozenOriginalPartsPreservedByteForByte': len(frozen), 'changedFrozenParts': changed,
        'originalSheetOrderAndAttributesPreserved': True, 'originalDefinedNamesPreserved': True,
        'originalSharedStringsPreservedAsPrefix': True, 'originalSharedStringCount': len(old_strings),
        'originalStyleEntriesPreservedAsPrefix': True, 'historicalStyleEntriesByGroup': style_groups,
        'uniqueTableNamesAndIds': True, 'newSheetFormulaErrors': formula_errors, 'newSheetFormulas': formula_rows,
        'deliveryIdentityCategoryFileAndBaseCellsChecked': 4 * len(register['assets']),
        'historicalGuideExtensionsPreserved': True,
        'nativeExcelRecalculation': 'not_run',
        'historicalParts': [{'path': name, 'sha256': sha(before.read(name))} for name in frozen],
    }
parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('--output-copy', type=Path, required=True,
                    help='Actual Artifact Tool packaged export to compare with the repository copy.')
temporary = parser.parse_args().output_copy
assert temporary.read_bytes() == OUTPUT.read_bytes()
report['temporaryAndDeliveredCopyByteIdentical'] = True
(HERE / 'workbook-ooxml-review.json').write_text(json.dumps(report, ensure_ascii=False, indent=2) + '\n')
print(json.dumps({key: report[key] for key in ['status', 'finalSheets', 'finalTables', 'allFrozenOriginalPartsPreservedByteForByte', 'outputSha256']}))
