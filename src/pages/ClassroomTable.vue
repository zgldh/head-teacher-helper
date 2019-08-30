<template>
  <q-page class="classroom-container column items-center">
    <q-btn-toggle
      class="q-ma-md"
      v-model="tableView"
      text-color="primary"
      :options="tableViews"></q-btn-toggle>
    <router-view></router-view>
    <add-student-modal ref="addStudentModal"></add-student-modal>
  </q-page>
</template>

<script>
import { mapState, mapGetters } from 'vuex'
import AddStudentModal from '../components/modals/AddStudentModal'

export default {
  name: 'ClassroomTable',
  components: {
    AddStudentModal
  },
  computed: {
    ...mapState({
      // ...
      classroom: state => state.classroom.currentClassroom,
      viewMode: state => state.classroom.viewMode,
      editorStatus: state => state.classroom.editorStatus,
      VIEWMODE_GRID: state => state.consts.VIEWMODE_GRID,
      VIEWMODE_TABLE: state => state.consts.VIEWMODE_TABLE,
      GRIDS_DESK: state => state.consts.GRIDS_DESK,
      GRIDS_FLOOR: state => state.consts.GRIDS_FLOOR,
      EDITOR_STATUS_DESK: state => state.classroom.EDITOR_STATUS_DESK,
      EDITOR_STATUS_SEAT: state => state.classroom.EDITOR_STATUS_SEAT
    }),
    ...mapGetters({
      tableViews: 'consts/tableViews'
    }),
    tableView: {
      get () {
        return this.innerTableView
      },
      set (value) {
        this.$router.push({ path: `/classroom/${this.$store.state.classroom.currentClassroom.id}/table/${value}` })
      }
    }
  },
  data () {
    return {
      innerTableView: 'basic'
    }
  },
  beforeRouteUpdate (to, from, next) {
    this.innerTableView = to.meta
    next()
  },
  created () {
    this.innerTableView = this.$route.meta
  },
  methods: {}
}
</script>

<style>
</style>
