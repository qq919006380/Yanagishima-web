<template>
  <div>
    <div class="header row align-items-center pt-3">
      <div class="col">
        <template v-if="!isLocalStorage">
          <template v-if="response && response.total">
            <span>{{response.hit}}</span>
            <template v-if="response.total !== response.hit">
              /
              <span>{{response.total}}</span>
              <span class="text-muted ml-1">({{(response.hit / response.total * 100).round()}}%)</span>
            </template>
          </template>
        </template>
        <template v-if="label">
          <button type="button" class="btn btn-sm btn-secondary" disabled>{{label}}</button>
          <button type="button" class="btn btn-sm btn-secondary" @click="clearLabel"><i class="fa fa-fw fa-times mr-1"></i></button>
        </template>
      </div>
      <div class="col text-right">
        {{isLocalStorage}}
        <template v-if="isLocalStorage">
          a
          <input type="text" class="form-control form-control-sm d-inline-block w-50"
                 placeholder="Filter by Query" v-model="filterModel" v-focus>
        </template>
        <template v-else>
          b
          <input type="text" class="form-control form-control-sm d-inline-block w-50"
                 placeholder="Search by Query" v-model.lazy="filterModel" v-focus @keyup.enter="getHistories(false)">
        </template>
      </div>
    </div>

    <div>
      <template v-if="loading">
        <div class="alert alert-info">
          <i class="fa fa-fw fa-spinner fa-pulse mr-1"></i>Loading
        </div>
      </template>
      <template v-else>
        <table v-if="filteredHistory.length" class="table table-bordered table-fixed table-hover">
          <thead>
          <tr>
           
            <th width="15%">Label</th>
            <th width="13%">查询ID</th>
            <th width="12%">开始时间</th>
            <th width="6%" class="text-right">占用时间</th>
            <th width="41.5%">查询</th>
            <!-- <th width="5%" class="text-center">Set</th> -->
            <th width="7.5%" class="text-center">查询结果</th>
          </tr>
          </thead>
          <tbody>
            <tr v-for="(h, i) in filteredHistory" :key="i" class="vertical-top">
              <td>
                <template v-if="h[7]">
                  <button type="button" class="btn btn-sm btn-secondary" @click="moveHisotryTab(h[7])">{{h[7]}}</button>
                </template>
              </td>
              <td>
                <a :href="buildUrl({datasource, engine, tab: 'treeview', queryid: h[0]})">{{h[0]}}</a>
              </td>
              <td>
                {{h[5] | extractDate}}
              </td>
              <td class="text-right">
                {{(h[2] / 1000).ceil(2)}}s
              </td>
              <td>
                <pre class="ace-font mb-0"><BaseHighlight :sentence="h[1].escapeHTML()" :keyword="filter.escapeHTML()"></BaseHighlight></pre>
              </td>
              <!-- <td class="text-center">
                <a href="#" class="btn btn-sm btn-secondary" @click.prevent="setQurey(h[1])"
                   title="Set query to editor"><i class="far fa-fw fa-keyboard"></i></a>
              </td> -->
              <td class="text-right overflow-visible">
                <div class="btn-group">
                  <a v-if="h[3] !== '0B'" :href="buildDownloadUrl(datasource, h[0], isCsv, includeHeader)" >{{h[3]}}<i
                    class="fa fa-fw fa-download ml-1"></i></a>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
        <div v-else class="alert alert-warning">
          <i class="fa fa-fw fa-frown-o mr-1"></i>暂无数据
        </div>
        <div v-if="!isLocalStorage && hasMore" class="p-3 text-center">
          <button type="button" class="btn btn-primary" @click="getHistories(true)">More</button>
        </div>
      </template>
    </div>
  </div>
</template>

<script>
import {mapState, mapGetters} from 'vuex'
import util from '@/mixins/util'

export default {
  name: 'TabHistory',
  mixins: [util],
  data () {
    return {
      checkedQueries: []
    }
  },
  computed: {
    ...mapState({
      isLocalStorage: state => state.settings.isLocalStorage,
      datasource: state => state.hash.datasource,
      engine: state => state.hash.engine,
      isCsv: state => state.settings.isCsv,
      includeHeader: state => state.settings.includeHeader
    }),
    ...mapState('history', [
      'filter',
      'loading',
      'response',
      'label'
    ]),
    ...mapGetters('history', [
      'hasMore'
    ]),
    filterModel: {
      get () {
        return this.filter
      },
      set (val) {
        this.$store.commit('history/setFilter', {data: val})
      }
    },
    filteredHistory () {
      if (!(this.response && this.response.results)) {
        return []
      }

      const history = this.response.results.filter(h => h[4] === this.engine)

      if (this.isLocalStorage) {
        const filter = this.filter.trim()
        const filters = filter.includes(' ') ? filter.split(' ').unique() : [filter]
        return history.filter(h => filters.every(f => new RegExp(RegExp.escape(f), 'ig').test(h[1])))
      } else {
        return history
      }
    }
  },
  mounted () {
    this.getHistories()
  },
  methods: {
    getHistories (isMore) {
      this.$store.dispatch('history/getHistories', {isMore})
    },
    setQurey (query) {
      this.$store.commit('editor/setInputQuery', {data: query})
      this.$store.commit('editor/focusOnEditor')
    },
    clearLabel () {
      this.$store.commit('history/setLabel', {data: null})
      this.$store.dispatch('history/getHistories', {isMore: false})
    },
    moveHisotryTab (label) {
      this.$store.commit('history/setLabel', {data: label})
      this.$store.dispatch('history/getHistories', {isMore: false})
    },
    compare () {
      const path = `/diff/?datasource=${this.datasource}&engine=${this.engine}&queryid1=${this.checkedQueries[0]}&queryid2=${this.checkedQueries[1]}`
      window.open(path, '_blank')
    }
  }
}
</script>

<style scoped>
</style>
