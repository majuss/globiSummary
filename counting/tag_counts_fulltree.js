'use strict';

const db = require('arangojs')();

db.query(
`
FOR v,e IN 1..100 OUTBOUND 'nodes_otl/304358' edges_otl
FILTER v.rank == "phylum"

LET origins_from = count(for x IN 1..100 OUTBOUND v edges_otl
                FILTER x.origin_from == 1 RETURN v) 

LET loss_from = count(for x IN 1..100 OUTBOUND v edges_otl
                FILTER x.loss_from == 1 RETURN v)



LET leaf_paras = count(FOR node IN 1..100 OUTBOUND v._id edges_otl
    FILTER 0 == LENGTH(FOR c,m,p IN OUTBOUND node._id edges_otl RETURN c)
    FILTER node.parasite == 1
    RETURN node._id)

LET leaf_parasw = count(FOR node IN 1..100 OUTBOUND v._id edges_otl
    FILTER 0 == LENGTH(FOR c,m,p IN OUTBOUND node._id edges_otl RETURN c)
    FILTER node.parasitew == 1
    RETURN node._id)

LET leaf_free = count(FOR node IN 1..100 OUTBOUND v._id edges_otl
    FILTER 0 == LENGTH(FOR c,m,p IN OUTBOUND node._id edges_otl RETURN c)
    FILTER node.freeliving == 1
    RETURN node._id)

LET leaf_freew = count(FOR node IN 1..100 OUTBOUND v._id edges_otl
    FILTER 0 == LENGTH(FOR c,m,p IN OUTBOUND node._id edges_otl RETURN c)
    FILTER node.freelivingw == 1
    RETURN node._id)

UPDATE v WITH { nr_origins_from: origins_from,
                nr_losses_from: loss_from,
                nr_leaf_parasites: leaf_paras,
                nr_leaf_parasites_weinstein: leaf_parasw,
                nr_leaf_freeliving: leaf_free,
                nr_leaf_freeliving_weinstein: leaf_freew
             } in nodes_otl


`);


/*
LET leaf_paras = (FOR node IN nodes_otl
    FILTER 0 == LENGTH(FOR v,e,p IN OUTBOUND node._id edges_otl_sub RETURN v)
    FILTER node.parasite == 1
    RETURN node._id)
        FOR leafid in leafids
            UPDATE {_key:SPLIT(leafid, '/')[1]} WITH {pi:1} IN nodes_otl_sub
*/