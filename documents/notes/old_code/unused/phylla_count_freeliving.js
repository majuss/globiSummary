'use strict';

var db = require('arangojs')();
db.query(`INSERT { _key: "phylla_metazoa_f" } IN counts`);
db.query(`INSERT { _key: "phylla_fungi_f" } IN counts`);
db.query(`INSERT { _key: "phylla_sar_f" } IN counts`);
db.query(`INSERT { _key: "phylla_plant_f" } IN counts`);


//retrieve counts for all METAZOA PARASITES

db.query(`FOR v,e IN 1..100 OUTBOUND 'nodes_otl_sub/691846' edges_otl_sub
          FILTER v.rank == 'phylum'
          RETURN v`, {}, { ttl: 1000 * 3600 }).then(getPhylum_metazoa);

function getPhylum_metazoa(cursor) {
    if (!cursor.hasNext()) { console.log('Finished metazoa'); return };
    cursor.next().then(doc => {
        try {
            insertPhylum_metazoa(doc);
        } catch (e) { }
        getPhylum_metazoa(cursor);
    });
}

async function insertPhylum_metazoa(currentDoc) {
    let phylumCount = await db.query(`
    RETURN COUNT(
    FOR v,e IN 1..100 outbound 'nodes_otl_sub/${currentDoc._key}' edges_otl_sub
          FILTER v.freeliving == 1
    RETURN v)`)
    db.query(`UPDATE "phylla_metazoa_f" WITH { ${currentDoc.name}: ${phylumCount._result} } IN counts`)
};

//retrieve counts for all FUNGI PARASITES

db.query(`FOR v,e IN 1..100 OUTBOUND 'nodes_otl_sub/352914' edges_otl_sub
          FILTER v.rank == 'phylum'
          RETURN v`, {}, { ttl: 1000 * 3600 }).then(getPhylum_fungi);

function getPhylum_fungi(cursor) {
    if (!cursor.hasNext()) { console.log('Finished fungi'); return };
    cursor.next().then(doc => {
        try {
            insertPhylum_fungi(doc);
        } catch (e) { }
        getPhylum_fungi(cursor);
    });
}

async function insertPhylum_fungi(currentDoc) {
    let phylumCount = await db.query(`
    return count(
    FOR v,e IN 1..100 outbound 'nodes_otl_sub/${currentDoc._key}' edges_otl_sub
          filter v.freeliving == 1
    RETURN v)`)
    db.query(`UPDATE "phylla_fungi_f" WITH { ${currentDoc.name}: ${phylumCount._result} } IN counts`)
};

//retrieve counts for all SAR PARASITES

db.query(`FOR v,e IN 1..100 outbound 'nodes_otl_sub/5246039' edges_otl_sub
          filter v.rank == 'phylum'
          RETURN v`, {}, { ttl: 1000 * 3600 }).then(getPhylum_sar);

function getPhylum_sar(cursor) {
    if (!cursor.hasNext()) { console.log('Finished sar'); return };
    cursor.next().then(doc => {
        try {
            insertPhylum_sar(doc);
        } catch (e) { }
        getPhylum_sar(cursor);
    });
}

async function insertPhylum_sar(currentDoc) {
    let phylumCount = await db.query(`
    return count(
    FOR v,e IN 1..100 outbound 'nodes_otl_sub/${currentDoc._key}' edges_otl_sub
          filter v.freeliving == 1
    RETURN v)`)
    db.query(`UPDATE "phylla_sar_f" WITH { ${currentDoc.name}: ${phylumCount._result} } IN counts`)
};

//retrieve counts for all PLANT PARASITES

db.query(`FOR v,e IN 1..100 outbound 'nodes_otl_sub/5268475' edges_otl_sub
          filter v.rank == 'phylum'
          RETURN v`, {}, { ttl: 1000 * 3600 }).then(getPhylum_plant);

function getPhylum_plant(cursor) {
    if (!cursor.hasNext()) { console.log('Finished plant phylla freeliving'); return };
    cursor.next().then(doc => {
        try {
            insertPhylum_plant(doc);
        } catch (e) { }
        getPhylum_plant(cursor);
    });
}

async function insertPhylum_plant(currentDoc) {
    let phylumCount = await db.query(`
    return count(
    FOR v,e IN 1..100 outbound 'nodes_otl_sub/${currentDoc._key}' edges_otl_sub
          filter v.freeliving == 1
    RETURN v)`)
    db.query(`UPDATE "phylla_plant_f" WITH { ${currentDoc.name}: ${phylumCount._result} } IN counts`)
};