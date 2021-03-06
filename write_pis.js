'use strict';

const fastango3 = require('fastango3');
const db = fastango3('http://127.0.0.1:8529');


function writepis() {

    const db = require('@arangodb').db;

    // write all leaf freeliving 0

    db._query(`
LET leafids=
    (FOR node IN nodes_otl_sub
    FILTER 0 == LENGTH(FOR v,e,p IN OUTBOUND node._id edges_otl_sub RETURN v)
    FILTER node.freeliving == 1
    RETURN node._id)
        FOR leafid in leafids
            UPDATE {_key:SPLIT(leafid, '/')[1]} WITH {pi:0} IN nodes_otl_sub`)


    // write all leaf paras 1

    db._query(`
LET leafids=
    (FOR node IN nodes_otl_sub
    FILTER 0 == LENGTH(FOR v,e,p IN OUTBOUND node._id edges_otl_sub RETURN v)
    FILTER node.parasite == 1
    RETURN node._id)
        FOR leafid in leafids
            UPDATE {_key:SPLIT(leafid, '/')[1]} WITH {pi:1} IN nodes_otl_sub`)


    // write all non para/free 0.5

    db._query(`
FOR doc IN nodes_otl_sub
FILTER doc.parasite == null && doc.freeliving == null
UPDATE doc WITH {pi: 0.5} IN nodes_otl_sub`);

    // all intermediate nodes that have 0 on either side

    db._query(`
for doc in nodes_otl_sub
filter doc.parasite == 0 && doc.freeliving == null || doc.freeliving == 0 && doc.parasite == null
update doc with {pi: 0.5} in nodes_otl_sub`);

    // all freeliving != sub(species) + genus... = 0.45

    db._query(`
for doc in nodes_otl_sub
filter doc.rank != 'species' && doc.rank != 'genus' && doc.rank != 'subspecies' && doc.rank != 'forma' && doc.rank != 'species subgroup' && doc.rank != 'species group' && doc.freeliving == 1
update doc WITH { pi: 0.45 } in nodes_otl_sub`);

    // all parasites != sub(species) + genus = 0.55

    db._query(`
for doc in nodes_otl_sub
filter doc.rank != 'species' && doc.rank != 'genus' && doc.rank != 'subspecies' && doc.rank != 'forma' && doc.rank != 'species subgroup' && doc.rank != 'species group' && doc.parasite == 1
update doc WITH { pi: 0.55 } in nodes_otl_sub`);

    // write freeliving under path length 14 0.45

    db._query(`LET leafids=
(FOR node IN nodes_otl_sub
FILTER 0 == LENGTH(FOR v,e,p IN OUTBOUND node._id edges_otl_sub RETURN v)
FILTER node.freeliving == 1
RETURN node._id)
FOR leafid in leafids
FILTER 13 >= LENGTH(FOR v,e IN INBOUND SHORTEST_PATH leafid TO 'nodes_otl_sub/304358' edges_otl_sub RETURN e)
UPDATE {_key:SPLIT(leafid, '/')[1]} WITH {pi:0.45} IN nodes_otl_sub`)


    // write freeliving under path length 8 0.499

    db._query(`LET leafids=
(FOR node IN nodes_otl_sub
FILTER 0 == LENGTH(FOR v,e,p IN OUTBOUND node._id edges_otl_sub RETURN v)
FILTER node.freeliving == 1
RETURN node._id)
FOR leafid in leafids
FILTER 7 >= LENGTH(FOR v,e IN INBOUND SHORTEST_PATH leafid TO 'nodes_otl_sub/304358' edges_otl_sub RETURN e)
UPDATE {_key:SPLIT(leafid, '/')[1]} WITH {pi:0.499} IN nodes_otl_sub`)

    // write leaf paras under path length 15 0.55

    db._query(`LET leafids=
(FOR node IN nodes_otl_sub
FILTER 0 == LENGTH(FOR v,e,p IN OUTBOUND node._id edges_otl_sub RETURN v)
FILTER node.parasite == 1
RETURN node._id)
FOR leafid in leafids
FILTER 13 >= LENGTH(FOR v,e IN INBOUND SHORTEST_PATH leafid TO 'nodes_otl_sub/304358' edges_otl_sub RETURN e)
UPDATE {_key:SPLIT(leafid, '/')[1]} WITH {pi:0.55} IN nodes_otl_sub`)


    // write leaf paras under path length 8 0.501

    db._query(`
LET leafids=
    (FOR node IN nodes_otl_sub
    FILTER 0 == LENGTH(FOR v,e,p IN OUTBOUND node._id edges_otl_sub RETURN v)
    FILTER node.parasite == 1
    RETURN node._id)
        FOR leafid in leafids
            FILTER 7 >= LENGTH(FOR v,e IN INBOUND SHORTEST_PATH leafid TO 'nodes_otl_sub/304358' edges_otl_sub RETURN e)
            UPDATE {_key:SPLIT(leafid, '/')[1]} WITH {pi:0.501} IN nodes_otl_sub`)


    //assign high ranks freeliving

    db._query(`
FOR doc IN nodes_otl_sub
FILTER doc.rank == 'phylum' || doc.rank == 'subkingdom' || doc.rank == 'kingdom' || doc.rank == 'domain' || doc.rank == 'infrakingdom' || doc.rank == 'superphylum' || doc.rank == 'infraphylum' || doc.rank == 'subphylum'
UPDATE doc WITH {pi: 0} IN nodes_otl_sub`);


    //assign high ranks freeliving based on outbound level of euk Root (outbound til phylla)

    db._query(`
FOR doc IN 0..5 OUTBOUND 'nodes_otl_sub/304358' edges_otl_sub
UPDATE doc WITH {pi: 0} IN nodes_otl_sub
`)




    let phylla = db._query(`
FOR doc IN OUTBOUND 'nodes_otl/691846' edges_otl
FILTER doc.rank == "phylum"
RETURN doc._id
`)

    for (const node of phylla) {
        db._query(`
    FOR v IN INBOUND SHORTEST_PATH '${node._id}' TO 'nodes_otl_sub/304358' edges_otl_sub
    UPDATE v WITH { pi: 0 } IN nodes_otl_sub
    `)
    }
}

db._txn({

    collections: {
        read: ['nodes_otl_sub'],
        write: ['nodes_otl_sub'],
    }
}, writepis, (status, headers, body) => {
    // console.log(status);
    body = JSON.parse(body);
    console.log(body);
    console.log("Finished write PI");
});