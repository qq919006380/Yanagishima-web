<template>
  <div>
    <div class="header row align-items-center pt-3">
      <div class="col">
        <template v-if="!isLocalStorage">
          <template v-if="response && response.total">
            <span>{{ response.hit }}</span>
            <template v-if="response.total !== response.hit">
              /
              <span>{{ response.total }}</span>
              <span class="text-muted ml-1">({{ (response.hit / response.total * 100).round() }}%)</span>
            </template>
          </template>
        </template>
        <template v-if="label">
          <button type="button" class="btn btn-sm btn-secondary" disabled>{{ label }}</button>
          <button type="button" class="btn btn-sm btn-secondary" @click="clearLabel"><i
              class="fa fa-fw fa-times mr-1"></i></button>
        </template>
      </div>
    </div>
    <Form ref="form" :model="form" label-width="70px">
      <div class="row justify-content-center">
        <div class="col-3">
          <FormItem label="任务ID">
            <Input size="small" v-model="form.id"></Input>
          </FormItem>
        </div>
        <div class="col-3">
          <FormItem label="开始时间">
            <DatePicker value-format="yyyy-MM-dd" style="width:100%" size="small" v-model="form.date" type="daterange"
              range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期">
            </DatePicker>
          </FormItem>
        </div>
        <div class="col-3">
          <FormItem label="SQL语句">
            <Input size="small" v-model="form.sql"></Input>
          </FormItem>
        </div>
        <div class="col-3">
          <FormItem>
            <Button size="small" type="primary" @click="search">查询</Button>
            <Button size="small" @click="reset">重置</Button>
          </FormItem>
        </div>

      </div>

    </Form>
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
              <th width="5%">序号</th>
              <th width="20%">任务ID</th>
              <th width="15%">开始时间</th>
              <th width="7%" class="text-right">占用时间</th>
              <th width="41.5%">查询</th>
              <!-- <th width="5%" class="text-center">Set</th> -->
              <th width="7.5%" class="text-center">查询结果</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(h, i) in filteredHistory" :key="i" class="vertical-top">
              <!-- 序号 -->
              <td>
                {{ i + 1 }}
              </td>
              <!-- 任务ID -->
              <td>
                <a :href="buildUrl({ datasource, engine, tab: 'treeview', queryid: h[0] })">{{ h[0] }}</a>
              </td>
              <!-- 开始时间 -->
              <td>
                {{ h[5] | extractDate }}
              </td>
              <td class="text-right">
                {{ (h[2] / 1000).ceil(2) }}s
              </td>
              <td>
                <pre
                  class="ace-font mb-0"><BaseHighlight :sentence="h[1].escapeHTML()" :keyword="filter.escapeHTML()"></BaseHighlight></pre>
              </td>
              <!-- <td class="text-center">
                <a href="#" class="btn btn-sm btn-secondary" @click.prevent="setQurey(h[1])"
                   title="Set query to editor"><i class="far fa-fw fa-keyboard"></i></a>
              </td> -->
              <td class="text-right overflow-visible">
                <div class="btn-group">
                  <a v-if="h[3] !== '0B'" :href="buildDownloadUrl(datasource, h[0], isCsv, includeHeader)">{{ h[3] }}<i
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
import { mapState, mapGetters } from 'vuex'
import dayjs from 'dayjs'
import isBetween from 'dayjs/plugin/isBetween'
import util from '@/mixins/util'
import { Form, FormItem, Input, Button, DatePicker } from "element-ui";
dayjs.extend(isBetween)
export default {
  components: { Form, FormItem, Input, Button, DatePicker },
  name: 'TabHistory',
  mixins: [util],
  data() {
    return {
      checkedQueries: [],
      filteredHistory: [],
      form: {
        id: "",
        date: "",
        sql: "",
      }
    }
  },
  watch: {
    'response.results'() {
      this.filteredHistory = this.response.results
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


  },
  mounted() {
    this.getHistories()


  },
  methods: {
    extractDate(val) {
      const dt = val.first(19)
      return Date.create(dt).format('{yyyy}-{MM}-{dd}')
    },
    // 对比查询时间
    diffDate(query, date) {
      if (query) {
        const isBetween = dayjs(date).isBetween(query[0], query[1], null, '[]');
        return isBetween
      } else {
        return true
      }

    },
    // 对比查询字符串
    diffSc(query, data) {
      if (query) {
        return data.includes(query)
      } else {
        return true
      }
    },
    search() {
      if (!(this.response && this.response.results)) {
        return []
      }
      var allEmty = Object.values(this.form).every(v => {
        return !v
      })

      this.filteredHistory = this.response.results.filter(v => {
        console.log(v)
        // if (allEmty) {
        //   return true
        // } else {
        console.log(this.diffSc(this.form.id, v[0]), this.diffSc(this.form.sql, v[1]), this.diffDate(this.form.date,this.extractDate(v[5])))
        return this.diffSc(this.form.id, v[0]) && this.diffSc(this.form.sql, v[1]) && this.diffDate(this.form.date,this.extractDate(v[5]))
        // }

      })
      console.log(this.filteredHistory)
    },
    reset() {
      Object.assign(this.form, this.$options.data().form)
      this.search()
    },
    getHistories(isMore) {
      this.$store.dispatch('history/getHistories', { isMore })
    },
    setQurey(query) {
      this.$store.commit('editor/setInputQuery', { data: query })
      this.$store.commit('editor/focusOnEditor')
    },
    clearLabel() {
      this.$store.commit('history/setLabel', { data: null })
      this.$store.dispatch('history/getHistories', { isMore: false })
    },
    moveHisotryTab(label) {
      this.$store.commit('history/setLabel', { data: label })
      this.$store.dispatch('history/getHistories', { isMore: false })
    },
    compare() {
      const path = `/diff/?datasource=${this.datasource}&engine=${this.engine}&queryid1=${this.checkedQueries[0]}&queryid2=${this.checkedQueries[1]}`
      window.open(path, '_blank')
    }
  }
}
</script>

<style scoped></style>
