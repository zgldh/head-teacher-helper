<template>
  <div class="student-datatable">
    <q-table
      title="纪律"
      :data="classroom.students"
      :columns="columns"
      :pagination.sync="pagination"
      row-key="id"
    >
    </q-table>
  </div>
</template>

<script>
import { mapState, mapGetters } from 'vuex'
// import _ from 'lodash'

export default {
  name: 'StudentDataTableDiscipline',
  components: {},
  props: {},
  data () {
    return {
      innerTableView: 'basic',
      pagination: {
        sortBy: null, // String, column "name" property value
        descending: false,
        page: 1,
        rowsPerPage: 0
      },
      columns: [
        {
          name: 'sno',
          required: true,
          label: '学号',
          align: 'left',
          field: 'sno',
          sortable: true,
          classes: 'sno',
          style: ''
        },
        {
          name: 'name',
          required: true,
          label: '名字',
          align: 'left',
          field: 'name',
          sortable: true,
          classes: 'name',
          style: ''
        },
        {
          name: 'gender',
          required: true,
          label: '性别',
          align: 'left',
          field: row => this.$store.state.consts.GENDERS.find(gender => gender.value === row.gender).label,
          sortable: true,
          classes: 'gender',
          style: ''
        },
        {
          name: 'seat_group',
          required: true,
          label: '组',
          align: 'left',
          field: row => this.getReadableSeatGroup(row.seat[1]),
          sortable: true,
          classes: 'seat',
          style: ''
        },
        {
          name: 'seat_row',
          required: true,
          label: '排',
          align: 'left',
          field: row => this.getReadableSeatRow(row.seat[0]),
          sortable: true,
          classes: 'seat',
          style: ''
        },
        {
          name: 'birthday',
          required: true,
          label: '生日',
          align: 'left',
          field: 'birthday',
          sortable: true,
          classes: 'birthday',
          style: ''
        },
        {
          name: 'positions',
          required: true,
          label: '岗位',
          align: 'left',
          field: 'positions',
          sortable: true,
          classes: 'positions',
          style: ''
        },
        {
          name: 'tags',
          required: true,
          label: '标签',
          align: 'left',
          field: 'tags',
          sortable: true,
          classes: 'tags',
          style: ''
        }
      ],
      tableData: []
    }
  },
  computed: {
    ...mapState({
      classroom: state => state.classroom.currentClassroom,
      TABLEVIEW_BASIC: state => state.consts.TABLEVIEW_BASIC,
      TABLEVIEW_SCORE: state => state.consts.TABLEVIEW_SCORE,
      TABLEVIEW_ACTIVITY: state => state.consts.TABLEVIEW_ACTIVITY,
      TABLEVIEW_DISCIPLINE: state => state.consts.TABLEVIEW_DISCIPLINE
    }),
    ...mapGetters({
      tableViews: 'consts/tableViews',
      getReadableSeatGroup: 'classroom/getReadableSeatGroup',
      getReadableSeatRow: 'classroom/getReadableSeatRow'
    }),
    tableView: {
      get () {
        return this.innerTableView
      },
      set (value) {
        this.innerTableView = value
      }
    }
  },
  created () {
  },
  methods: {}
}
</script>

<style>
  .student-datatable {
  }

  .student-datatable .q-table-container thead tr:first-child th {
    position: sticky;
    top: 0;
    background: white;
    z-index: 1000
  }

  .student-datatable .q-table-container .q-table-middle.scroll {
    max-height: calc(100vh - 250px);
  }
</style>
