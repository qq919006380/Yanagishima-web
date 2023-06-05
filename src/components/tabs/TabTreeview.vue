<template>
  <div id="treeview">
    <div class="  row align-items-start  ">
      <div class="col-3">
        <Input class="py-3" size="small" placeholder="输入关键字进行过滤" v-model="filterText"></Input>
        <Tree ref="tree" :filter-node-method="filterNode" :props="props" :load="loadNode" lazy>
          <span slot-scope="{ node, data }">
            <span v-if="['catalog', 'schema'].includes(data.type)">
              <Icon :type="data.type"></Icon>
              {{ node.label }}
            </span>
            <span class="custom-tree-node" v-if="data.type == 'table'">
              <span @click="showSnippet(data, node)">
                <Icon :type="data.type"></Icon>
                <span v-for="(item, index) in node.label" :class="{ tips: index > 0 }">{{ item }}</span>
              </span>
              <div @click="openColumnsDialog(data, node)">
                <Icon class="detail" type="d"></Icon>
              </div>
            </span>
          </span>
        </Tree>
      </div>
      <div class="col-9">
        <TabResult />
      </div>
    </div>

    <div>



    </div>
    <Dialog title="字段" :visible.sync="dialogVisible" width="50%">
      <Table v-loading="loading" :data="columnsTableData" height="500px" style="width: 100%">
        <Table-column prop="column" label="列"></Table-column>
        <Table-column prop="type" label="类型"></Table-column>
        <Table-column prop="extra" label="说明"></Table-column>
        <Table-column prop="comment" label="备注"></Table-column>
      </Table>
      <span slot="footer" class="dialog-footer">
        <Button @click="dialogVisible = false">关 闭</Button>
      </span>
    </Dialog>
  </div>
</template>

<script>
import toastr from 'toastr'

import TabResult from '@/components/tabs/TabResult'
import Icon from './icon'
import { mapState, mapGetters } from 'vuex'
// import { Tree } from "ant-design-vue";
import { Tree, Input, Dialog, Button, Table, TableColumn } from "element-ui";

export default {
  name: 'TabTreeview',
  components: { TabResult, Tree, Icon, Input, Dialog, Button, Table, TableColumn },
  data() {
    return {
      loading: false,
      dialogVisible: false,
      filterText: "",
      isExpandColumns: false,
      snippetIndex: 0,
      scrollTo: {},
      props: {
        label: 'title',
        children: 'zones',
        isLeaf: 'leaf'
      },
    }
  },
  computed: {
    columnsTableData() {
      var a = this.columns.map(v => {
        return {
          column: v[0],
          type: v[1],
          extra: v[3],
          comment: v[4]

        }
      })
      return a
    },
    ...mapState({
      datasources: state => state.datasources,
      datasource: state => state.hash.datasource,
      initialTable: state => state.hash.table
    }),
    ...mapState('treeview', [
      'catalogs',
      'schemata',
      'tables',
      'catalog',
      'schema',
      'table',
      'note',
      'meta',
      'tableType',
      'columns',
      'tableQuery',
      'filterSchema',
      'filterTable',
      'loadingTableSearch',
      'loadingPartitions',
      'tableSearchResponse'
    ]),
    ...mapGetters([
      'isPresto',
      'isHive',
      'isSpark',
      'isElasticsearch',
      'datasourceEngine',
      'isMetadataService'
    ]),
    ...mapGetters('treeview', [
      'dateColumn',
      'otherColumns',
      'partitionKeys'
    ]),
    filteredSchemata() {
      return this.schemata.filter(s => s.includes(this.filterSchema))
    },
    filteredTables() {
      return this.tables.filter(s => s[0].includes(this.filterTable))
    },
    tableQueryModel: {
      get() {
        return this.tableQuery
      },
      set(val) {
        this.$store.commit('treeview/setTableQuery', { data: val })
      }
    },
    filterSchemaModel: {
      get() {
        return this.filterSchema
      },
      set(val) {
        this.$store.commit('treeview/setFilterSchema', { data: val })
      }
    },
    filterTableModel: {
      get() {
        return this.filterTable
      },
      set(val) {
        this.$store.commit('treeview/setFilterTable', { data: val })
      }
    },

  },
  watch: {
    filterText(val) {
      this.$refs.tree.filter(val);
    },
    datasourceEngine() {
      this.$store.commit('setHashItem', { table: '' })
      this.$store.dispatch('treeview/getRoot')
    },
    // catalog(val) {
    //   console.log(val)
    // if (val) {
    //   if (this.scrollTo.catalog && this.scrollTo.catalog !== val) {
    //     this.setCatalog(this.scrollTo.catalog)
    //     this.scrollTo.catalog = null
    //     return
    //   }
    //   this.$store.dispatch('treeview/getSchemata')
    //   this.$store.dispatch('editor/getCompleteWords')
    // }
    // this.$store.commit('treeview/setTableQuery', { data: '' })
    // },
    // schema(val) {
    // if (val) {
    //   if (this.scrollTo.schema && this.scrollTo.schema !== val) {
    //     if (!this.schemata.includes(this.scrollTo.schema)) {
    //       toastr.error(`schema not found: ${this.scrollTo.schema}`)
    //       this.scrollTo = {}
    //       return
    //     }
    //     this.setSchema(this.scrollTo.schema)
    //     return
    //   }
    //   this.$store.dispatch('treeview/getTables')
    //     .then(() => {
    //       if (this.scrollTo.schema) {
    //         document.getElementById(`schema-${this.scrollTo.schema}`).scrollIntoView()
    //         window.scrollTo(0, 0)
    //         this.scrollTo.schema = null
    //       }
    //       if (this.scrollTo.table) {
    //         const table = this.tables.find(t => t[0] === this.scrollTo.table)
    //         if (!table) {
    //           toastr.error(`table not found: ${this.scrollTo.table}`)
    //           this.scrollTo = {}
    //           return
    //         }
    //         this.setTable(table)
    //         document.getElementById(`table-${table[0]}`).scrollIntoView()
    //         window.scrollTo(0, 0)
    //         this.scrollTo.table = null
    //       }
    //     })
    // }
    // },
    // table(val) {
    //   if (val) {
    //     this.$store.dispatch('treeview/getColumns')
    //   }
    // },
    // tableQuery() {
    //   this.searchTable()
    // }
  },
  created() {
    if (this.initialTable) {
      if (this.isPresto || this.isHive || this.isSpark) {
        this.$store.commit('treeview/init')
        const t = this.initialTable.split('.')
        if (this.isPresto) {
          this.scrollTo = { catalog: t[0], schema: t[1], table: t[2] }
        } else {
          this.scrollTo = { schema: t[0], table: t[1] }
        }
      }
    }

    this.$store.dispatch('treeview/getRoot')
  },
  beforeDestroy() {
    this.$store.commit('setHashItem', { table: '' })
  },
  methods: {

    filterNode(value, data) {
      if (!value) return true;
      return data.title.indexOf(value) !== -1;
    },
    async loadNode(node, resolve) {
      console.log(node)
      if (node.level === 0) {
        await this.$store.dispatch('treeview/getCatalogs')
        var data = this.catalogs.map(v => {
          return { title: v, type: "catalog" }
        })
        return resolve(data);
      } else if (node.level === 1) {
        this.setCatalog(node.data.title)
        await this.$store.dispatch('treeview/getSchemata')
        this.$store.dispatch('editor/getCompleteWords')
        this.$store.commit('treeview/setTableQuery', { data: '' })
        var data = this.schemata.map(v => {
          return { title: v, type: "schema" }
        })
        return resolve(data);
      } else if (node.level === 2) {
        this.setCatalog(node.parent.data.title)
        this.setSchema(node.data.title)
        await this.$store.dispatch('treeview/getTables')
        var data = this.tables.map(v => {
          return { title: v, leaf: true, type: 'table' }
        })
        return resolve(data);
      }


    },
    showSnippet(data, node) {
      this.setCatalog(node.parent.parent.data.title)
      this.setSchema(node.parent.data.title)
      this.setTable(data.title)
    },
    async openColumnsDialog(data, node) {
      this.loading = true
      this.dialogVisible = true
      this.setCatalog(node.parent.parent.data.title)
      this.setSchema(node.parent.data.title)
      this.setTable(data.title)
      await this.$store.dispatch('treeview/getColumns')
      this.loading = false
    },
    onSelect(data) {
      console.log(data)
    },
    setDatasource(datasource) {
      this.$store.commit('setHashItem', { datasource })
    },
    setCatalog(catalog) {
      this.$store.commit('treeview/setCatalog', { data: catalog })
    },
    setSchema(schema) {
      this.$store.commit('treeview/setSchema', { data: schema })
    },
    setTable(table) {
      this.$store.commit('treeview/setTable', { data: table })
    },
    getPartitions() {
      this.$store.dispatch('treeview/getPartitions')
    },
    fullName(table) {
      if (this.isPresto) {
        return [this.catalog, this.schema, table].join('.')
      } else if (this.isHive || this.isSpark) {
        return [this.schema, table].join('.')
      } else if (this.isElasticsearch) {
        return table
      } else {
        throw new Error('not supported')
      }
    },
    setSnippet() {
      let snippet = this.snippets[this.snippetIndex].sql
      this.$store.commit('editor/setInputQuery', {
        data: snippet.format({
          catalog: this.catalog,
          schema: this.schema,
          table: this.table,
          column_date: this.dateColumn,
          columns: this.isExpandColumns ? this.otherColumns : '*',
          yesterday: Date.create().addDays(-1).format('{yyyy}{MM}{dd}')
        })
      })
    },
    runSnippet() {
      this.setSnippet()
      this.$store.dispatch('result/runQuery')
      this.$store.commit('setHashItem', { tab: 'treeview' })
    },
    searchTable() {
      this.$store.dispatch('treeview/searchTable')
    },
    setSearchedTable(item) {
      const [catalog, schema, table, tableType] = item
      this.$store.commit('treeview/setCatalog', { data: catalog })
      this.$store.commit('treeview/setSchema', { data: schema })
      this.$store.commit('treeview/setTable', { data: [table, tableType] })
    },
    clearTableQuery() {
      this.tableQueryModel = ''
      this.$store.commit('treeview/setTableSearchResponse', { data: [] })
      this.$store.commit('treeview/setTable', { data: ['', ''] })
    }
  }
}
</script>

<style scoped lang="scss">
.tips {
  color: #999;
  font-size: 12px;
  margin-left: 10px;
}

.pull-right {
  float: right;
}

.detail {
  cursor: pointer;
  transition: all 0.3s;
  opacity: 0;
}

.custom-tree-node:hover {
  .detail {
    opacity: 1;
  }
}

.custom-tree-node {
  width: 250px;
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-right: 8px;


}
</style>
