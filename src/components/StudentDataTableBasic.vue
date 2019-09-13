<template>
  <div class="student-datatable">
    <q-table
      title="基本信息"
      :data="classroom.students"
      :columns="columns"
      :pagination.sync="pagination"
      selection="single"
      :selected.sync="selectedStudent"
      row-key="id"
      no-data-label="还没有任何学生。点击最上方左边第一个按钮添加学生。"
    ></q-table>
  </div>
</template>

<script>
import { mapState, mapGetters } from 'vuex'
// import _ from 'lodash'

export default {
  name: 'StudentDataTableBasic',
  components: {},
  props: {},
  data () {
    return {
      editing: {
        sno: null,
        name: null,
        gender: null,
        birthday: null,
        enrollmentDate: null,
        positions: null,
        tags: null
      },
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
          field: 'gender',
          sortable: true,
          classes: 'gender',
          style: '',
          format: val => `${this.genders.find(gender => gender.value === val).label}`
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
          style: '',
          format: val => `${(val || '').substr(0, 10)}`
        },
        {
          name: 'enrollmentDate',
          required: true,
          label: '入学日期',
          align: 'left',
          field: 'enrollmentDate',
          sortable: true,
          classes: 'enrollmentDate',
          style: '',
          format: val => `${(val || '').substr(0, 10)}`
        },
        {
          name: 'positions',
          required: true,
          label: '岗位',
          align: 'left',
          field: 'positions',
          sortable: true,
          classes: 'positions',
          style: '',
          format: val => `${(val || []).map(position => this.classroomPositions.find(pos => pos.value === position).label).join(', ')}`
        },
        {
          name: 'tags',
          required: true,
          label: '标签',
          align: 'left',
          field: 'tags',
          sortable: true,
          classes: 'tags',
          style: '',
          format: val => `${(val || []).join(', ')}`
        }
      ],
      tableData: []
    }
  },
  computed: {
    ...mapState({
      classroom: state => state.classroom.currentClassroom,
      genders: state => state.consts.GENDERS,
      classroomPositions: state => state.classroom.currentClassroom.positions
    }),
    ...mapGetters({
      getReadableSeatGroup: 'classroom/getReadableSeatGroup',
      getReadableSeatRow: 'classroom/getReadableSeatRow'
    }),
    selectedStudent: {
      get () {
        return this.$store.state.classroom.selectedStudent ? [this.$store.state.classroom.selectedStudent] : []
      },
      set (value) {
        if (value.length) {
          const selectedStudentId = value[0].id
          if (!this.$store.state.classroom.selectedStudent || selectedStudentId !== this.$store.state.classroom.selectedStudent.id) {
            this.$store.dispatch('classroom/selectStudent', this.classroom.students.find(student => student.id === selectedStudentId))
          }
        } else {
          this.$store.dispatch('classroom/cleanSelectedStudent')
        }
      }
    }
  },
  created () {
  },
  mounted () {
    if (this.selectedStudent) {
      this.scrollToSelected()
    }
  },
  methods: {
    scrollToSelected () {
      const selectedTr = document.querySelector('tr.selected')
      if (selectedTr) {
        selectedTr.scrollIntoViewIfNeeded()
      }
    }
  }
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

  .student-datatable .gender-select {
    font-size: 13px;
    line-height: 13px;
    height: 13px;
  }

  .student-datatable .gender-select .q-icon.q-if-control.material-icons {
    display: none;
  }
</style>
