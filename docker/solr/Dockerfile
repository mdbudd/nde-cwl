FROM solr:8

ENTRYPOINT precreate-core sch_live /var/solr/configsets/search_configs; \
        precreate-core sch_rebuild /var/solr/configsets/search_configs; \
        exec solr -f