<template>
  <div>
    <div>
      <template v-if="loading">
        <div class="alert alert-info">
          <i class="fa fa-fw fa-spinner fa-pulse mr-1"></i>Loading
        </div>
      </template>
      <template v-else>
        <table class="table table-bordered table-fixed table-hover" v-if="response && response.length">
          <thead>
            <tr>
              <th width="5%" class="text-right">ID</th>
              <th width="20%">标题</th>
              <th width="60%">查询</th>
              <th width="15%" class="text-center">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr class="vertical-top" v-for="item in response" :key="item.bookmark_id"
              :class="{ 'table-warning': item.bookmark_id === addedBookmarkId }">
              <td class="text-right">
                {{ item.bookmark_id }}
              </td>
              <td>
                <template v-if="item.title">{{ item.title }}</template>
                <span class="text-muted" v-else>(none)</span>
              </td>
              <td>
                <BaseAce :code="item.query" :readonly="true" css-class="bg-transparent"></BaseAce>
              </td>

              <td class="text-center">
                <a href="#" class="btn btn-sm btn-secondary" @click.prevent="setBookmark(item)"> 配置</a>
                <a href="#" class="btn btn-sm btn-secondary"  @click.prevent="deleteBookmark(item.bookmark_id)">取消收藏 </a>
              </td>
            </tr>
          </tbody>
        </table>
        <div class="alert alert-warning" v-else>
          <i class="fa fa-fw fa-frown-o mr-1"></i>暂无数据
        </div>
      </template>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { Link } from "element-ui";
export default {
  name: 'TabBookmark',
  components: { Link },
  computed: {
    ...mapState('bookmark', [
      'bookmarks',
      'addedBookmarkId',
      'loading',
      'response'
    ])
  },
  methods: {
    setBookmark(bookmark) {
      this.$store.commit('editor/setInputQuery', { data: bookmark.query })
      this.$store.commit('editor/focusOnEditor')
      this.$store.commit('result/setResponse', { data: null })
      this.$store.commit('result/setQueryString', { data: '' })
      this.$store.commit('setHashItem', { bookmark_id: bookmark.bookmark_id, queryid: '' })
    },
    deleteBookmark(bookmarkId) {
      this.$store.dispatch('bookmark/deleteBookmarkItem', { bookmarkId })
    }
  }
}
</script>

<style scoped></style>
