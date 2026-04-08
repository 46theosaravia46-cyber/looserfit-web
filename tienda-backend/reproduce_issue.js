
const { _normalizeTalles, validateSizes } = require('./src/services/productService');
const { SIZES_BY_CATEGORY } = require('./src/constants/products');

const test = async () => {
    console.log('--- Testing _normalizeTalles ---');
    console.log('String "S":', _normalizeTalles("S"));
    console.log('Array ["S", "M"]:', _normalizeTalles(["S", "M"]));
    console.log('Stringified array "["S"]":', _normalizeTalles('["S"]'));
    console.log('Empty string "":', _normalizeTalles(""));
    console.log('Undefined:', _normalizeTalles(undefined));
    console.log('String "undefined":', _normalizeTalles("undefined"));

    console.log('\n--- Testing validateSizes ---');
    const allValidSizes = [...new Set(Object.values(SIZES_BY_CATEGORY).flat())];
    console.log('All valid sizes count:', allValidSizes.length);
    console.log('Sample sizes:', allValidSizes.slice(0, 5));

    try {
        await validateSizes('some-id', ["S"]);
        console.log('Validation passed for ["S"]');
    } catch (e) {
        console.error('Validation FAILED for ["S"]:', e.message);
    }

    try {
        await validateSizes('some-id', ["Talle Único"]);
        console.log('Validation passed for ["Talle Único"]');
    } catch (e) {
        console.error('Validation FAILED for ["Talle Único"]:', e.message);
    }

    try {
        await validateSizes('some-id', ["InvalidSize"]);
        console.log('Validation passed for ["InvalidSize"] (EXPECTED FAILURE)');
    } catch (e) {
        console.log('Validation FAILED for ["InvalidSize"] (EXPECTED):', e.message);
    }
};

test();
