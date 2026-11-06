// The `math` table contains information for math layou
// https://docs.microsoft.com/en-us/typography/opentype/spec/math

import parse from '../parse.mjs';
import table from '../table.mjs';

function parseMathValue() {
  const value = this.parseShort();
  this.parseOffset16();  // ignore for now
  return value;
}

function parseMathValueRecord() {
  return {
    value: this.parseShort(),
    deviceTable: this.parseOffset16()
  };
}

function parseMathConstants() {
  return this.parseStruct({
    scriptPercentScaleDown: this.parseShort,
    scriptScriptPercentScaleDown: this.parseShort,
    delimitedSubFormulaMinHeight: this.parseUShort,
    displayOperatorMinHeight: this.parseUShort,
    mathLeading: parseMathValue,
    axisHeight: parseMathValue,
    accentBaseHeight: parseMathValue,
    flattenedAccentBaseHeight: parseMathValue,
    subscriptShiftDown: parseMathValue,
    subscriptTopMax: parseMathValue,
    subscriptBaselineDropMin: parseMathValue,
    superscriptShiftUp: parseMathValue,
    superscriptShiftUpCramped: parseMathValue,
    superscriptBottomMin: parseMathValue,
    superscriptBaselineDropMax: parseMathValue,
    subSuperscriptGapMin: parseMathValue,
    superscriptBottomMaxWithSubscript: parseMathValue,
    spaceAfterScript: parseMathValue,
    upperLimitGapMin: parseMathValue,
    upperLimitBaselineRiseMin: parseMathValue,
    lowerLimitGapMin: parseMathValue,
    lowerLimitBaselineDropMin: parseMathValue,
    stackTopShiftUp: parseMathValue,
    stackTopDisplayStyleShiftUp: parseMathValue,
    stackBottomShiftDown: parseMathValue,
    stackBottomDisplayStyleShiftDown: parseMathValue,
    stackGapMin: parseMathValue,
    stackDisplayStyleGapMin: parseMathValue,
    stretchStackTopShiftUp: parseMathValue,
    stretchStackBottomShiftDown: parseMathValue,
    stretchStackGapAboveMin: parseMathValue,
    stretchStackGapBelowMin: parseMathValue,
    fractionNumeratorShiftUp: parseMathValue,
    fractionNumeratorDisplayStyleShiftUp: parseMathValue,
    fractionDenominatorShiftDown: parseMathValue,
    fractionDenominatorDisplayStyleShiftDown: parseMathValue,
    fractionNumeratorGapMin: parseMathValue,
    fractionNumDisplayStyleGapMin: parseMathValue,
    fractionRuleThickness: parseMathValue,
    fractionDenominatorGapMin: parseMathValue,
    fractionDenomDisplayStyleGapMin: parseMathValue,
    skewedFractionHorizontalGap: parseMathValue,
    skewedFractionVerticalGap: parseMathValue,
    overbarVerticalGap: parseMathValue,
    overbarRuleThickness: parseMathValue,
    overbarExtraAscender: parseMathValue,
    underbarVerticalGap: parseMathValue,
    underbarRuleThickness: parseMathValue,
    underbarExtraDescender: parseMathValue,
    radicalVerticalGap: parseMathValue,
    radicalDisplayStyleVerticalGap: parseMathValue,
    radicalRuleThickness: parseMathValue,
    radicalExtraAscender: parseMathValue,
    radicalKernBeforeDegree: parseMathValue,
    radicalKernAfterDegree: parseMathValue,
    radicalDegreeBottomRaisePercent: this.parseShort
  });
}

function parseMathRecordList() {
  const coverage = this.parsePointer(this.parseCoverage);
  const count = this.parseUShort();
  return {
    coverage,
    count,
    records: this.parseList(count, parseMathValue)
  };
}

function parseExtendedShapeCoverage() {
  return this.parseCoverage();
}

function parseMathGlyphInfo() {
  return {
    italicsCorrectionInfo: this.parsePointer(parseMathRecordList),
    topAccentAttachment: this.parsePointer(parseMathRecordList),
    extendedShapeCoverage: this.parsePointer(parseExtendedShapeCoverage),
    kernInfo: this.parsePointer(parseMathRecordList)
  };
}

function parseGlyphAssembly() {
  const italicsCorrection = parseMathValue.call(this);
  const partCount = this.parseUShort();
  return {
    italicsCorrection,
    partCount,
    partRecords: this.parseRecordList(partCount, {
      glyphID: this.parseUShort,
      startConnectorLength: this.parseUShort,
      endConnectorLength: this.parseUShort,
      fullAdvance: this.parseUShort,
      partFlags: this.parseUShort
    })
  };
}

function parseGlyphConstruction() {
  return this.parsePointer(function () {
    const glyphAssembly = this.parsePointer(parseGlyphAssembly);
    const variantCount = this.parseUShort();
    return {
      glyphAssembly,
      variantCount,
      variantRecords: this.parseRecordList(variantCount, {
        variantGlyph: this.parseUShort,
        advanceMeasurement: this.parseUShort
      })
    };
  });
}

function parseMathVariants() {
  const minConnectorOverlap = this.parseUShort();
  const vertGlyphCoverage = this.parsePointer(this.parseCoverage);
  const horizGlyphCoverage = this.parsePointer(this.parseCoverage);
  const vertGlyphCount = this.parseUShort();
  const horizGlyphCount = this.parseUShort();
  return {
    minConnectorOverlap,
    vertGlyphCoverage,
    horizGlyphCoverage,
    vertGlyphCount,
    horizGlyphCount,
    vertGlyphConstructions: this.parseList(vertGlyphCount, parseGlyphConstruction),
    horizGlyphConstructions: this.parseList(horizGlyphCount, parseGlyphConstruction)
  };
}

//
// Parse the OpenMath 'MATH' table
//
function parseMathTable(data, start) {
  const math = {};
  const p = new parse.Parser(data, start);
  math.version = p.parseVersion();
  math.constants = p.parsePointer(parseMathConstants);
  math.glyphinfo = p.parsePointer(parseMathGlyphInfo);
  math.variants = p.parsePointer(parseMathVariants);
  return math;
}

//
// Write the OpenMath 'MATH' table
//
function makeMathTable(options) {
  return new table.Table('MATH', [
    {name: 'version', type: 'ULONG', value: 0x10000},
  ], options);
}

export default {parse: parseMathTable, make: makeMathTable};
