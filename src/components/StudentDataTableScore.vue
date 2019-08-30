<template>
  <div class="student-datatable">
    <q-table
      title="成绩"
      :data="scoreData"
      :columns="columns"
      :pagination.sync="pagination"
      :loading="isLoading"
      row-key="id"
    >
      <div slot="top-right" slot-scope="props" class="row">
        <q-select
          v-model="selectedCourse"
          stack-label="课程"
          hide-underline
          :options="$store.state.consts.COURSES"
          @change="onCourseChange"
          color="secondary"
          style="min-width: 100px;margin-right: 1em;"
        />
        <q-btn icon="add" color="primary" :label="addCourseTestButtonLabel" @click="addCourseTest" />
        <q-btn icon="view_column" :color="columnsEditing?'green':''" flat @click="columnsEditing = !columnsEditing" />
        <q-btn icon="edit" :color="isScoreInputting?'green':''" flat @click="onToggleScoreInputButton" />
      </div>
      <q-tr slot="header" slot-scope="props" :props="props">
        <q-th class="text-left sortable" :class="col.name" v-for="(col, index) in props.cols" :key="col.name" :props="props">
          <q-btn-group dense flat v-if="columnsEditing && !['sno','name'].includes(col.name)" style="display:block;">
            <q-btn :disable="index<=2" rounded dense flat
              icon="chevron_left" :text-color="index<=2?'grey':'primary'" @click.stop="onMoveColumnLeft(col)" />
            <q-btn rounded dense flat
              icon="edit" text-color="green" @click.stop="onEditColumnClick(col)" />
            <q-btn rounded dense flat
              icon="close" text-color="red" @click.stop="onDeleteColumnClick(col)" />
            <q-btn :disable="index>=props.cols.length-1" rounded dense flat
              icon="chevron_right" :text-color="index>=props.cols.length-1?'grey':'primary'" @click.stop="onMoveColumnRight(col)" />
          </q-btn-group>
          <span>{{ col.label }}</span>
          <q-tooltip v-if="col._test">{{ col._test.date.toISOString().substr(0, 10) }}</q-tooltip>
        </q-th>
      </q-tr>

      <q-tr slot="body" slot-scope="props" :props="props">
        <q-td :props="props" key="sno">{{ props.row.sno }}</q-td>
        <q-td :props="props" key="name">{{ props.row.name }}</q-td>
        <q-td :props="props" v-for="test in courseTests"
          :key="getTestColumnName(selectedCourse, test.id)" class="score-input-td">
          <input class="score-input" type="text" :value="props.row[getTestColumnName(selectedCourse, test.id)]"
            v-if="isScoreInputting"
            @change="onScoreChange($event, test.id, props.row.id)" @focus="$event.target.select()"
            @keypress.exact="onScoreKeyPress($event)"
            @keypress.shift.enter="onScoreJumpNextRow($event)"
            @keypress.shift.j.prevent="onScoreJumpNextRow($event)"
            @keypress.shift.k.prevent="onScoreJumpPreRow($event)"
            @keypress.shift.h.prevent="onScoreJumpPreColumn($event)"
            @keypress.shift.l.prevent="onScoreJumpNextColumn($event)"
            />
          <span class="score-span" v-else>{{props.row[getTestColumnName(selectedCourse, test.id)]}}</span>
        </q-td>
      </q-tr>
    </q-table>
    <add-course-test-modal ref="addCourseTestModal" />
  </div>
</template>

<script>
import { mapState, mapGetters } from 'vuex'
import AddCourseTestModal from './modals/AddCourseTestModal'
import { loadScoresByTests, updateScoreByStudentAndTest } from '../apis/offline'
import Vue from 'vue'

export default {
  name: 'StudentDataTableScore',
  components: {
    AddCourseTestModal
  },
  props: {},
  data () {
    return {
      isLoading: false,
      isScoreInputting: false,
      innerTableView: 'basic',
      pagination: {
        sortBy: null, // String, column "name" property value
        descending: false,
        page: 1,
        rowsPerPage: 0
      },
      selectedCourse: 'chinese',
      columnsEditing: false,
      /**
       * {
       *  <studentId>: {
       *    <testId>: 123,
       *    <testId>: 456,
       *  },
       *  <studentId>: {
       *    <testId>: 123,
       *    <testId>: 456,
       *  }
       * }
       */
      studentScores: {}
    }
  },
  computed: {
    ...mapState({
      classroom: state => state.classroom.currentClassroom,
      tests: state => state.classroom.tests,
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
    scoreData () {
      return this.classroom.students.map(student => {
        let scores = {}
        this.courseTests.forEach(test => {
          scores[this.getTestColumnName(this.selectedCourse, test.id)] = this.studentScores[`${student.id}-${test.id}`]
        })
        return Object.assign({}, student, scores)
      })
    },
    courseTests () {
      let courseTests = this.tests[this.selectedCourse]
      courseTests.sort((a, b) => a.index - b.index)
      return courseTests
    },
    columns () {
      let innerColumns = [
        {
          name: 'sno',
          required: true,
          label: '学号',
          align: 'left',
          field: 'sno',
          sortable: !this.isScoreInputting,
          classes: 'sno',
          style: ''
        },
        {
          name: 'name',
          required: true,
          label: '名字',
          align: 'left',
          field: 'name',
          sortable: !this.isScoreInputting,
          classes: 'name',
          style: ''
        }
      ]
      this.courseTests.forEach(test => {
        innerColumns.push({
          name: this.getTestColumnName(this.selectedCourse, test.id),
          required: true,
          label: test.name,
          align: 'left',
          field: this.getTestColumnName(this.selectedCourse, test.id),
          sortable: !this.isScoreInputting,
          classes: 'score',
          style: 'width:100px',
          _test: test
        })
      })
      return innerColumns
    },
    addCourseTestButtonLabel () {
      const course = this.$store.state.consts.COURSES.find((item) => {
        return item.value === this.selectedCourse
      })
      return `添加${course.label}考试`
    },
    tableView: {
      get () {
        return this.innerTableView
      },
      set (value) {
        this.innerTableView = value
      }
    }
  },
  watch: {
    courseTests: {
      handler: function (val, oldVal) {
        this.onCourseChange(this.selectedCourse)
      },
      immediate: true,
      deep: true
    }
  },
  created () {
  },
  mounted () {
  },
  methods: {
    getTestColumnName (course, testId) {
      return `${course}-${testId}`
    },
    addCourseTest () {
      this.$refs['addCourseTestModal'].open(this.selectedCourse, this.addCourseTestButtonLabel)
        .then(result => {
          return this.$store.dispatch('classroom/addCourseTest', result)
        }).catch(err => {
          console.log(err)
        })
    },
    onEditColumnClick (col) {
      this.$refs['addCourseTestModal'].open(this.selectedCourse, `编辑“${col.label}”考试`,
        col._test.name,
        col._test.date)
        .then(result => {
          return this.$store.dispatch('classroom/updateCourseTest', {
            id: col._test.id,
            course: this.selectedCourse,
            name: result.name,
            date: result.date,
            index: col._test.index })
        }).catch(err => {
          console.log(err)
        })
    },
    onDeleteColumnClick (col) {
      return this.$q.dialog({
        title: `确定要删除 “${col.label}” 吗？`,
        message: '关联的学生成绩也会被删除。',
        ok: {
          color: 'red',
          label: '删除'
        },
        cancel: '算了'
      }).then(async () => {
        await this.$store.dispatch('classroom/deleteCourseTest', { id: col._test.id, course: this.selectedCourse })
      }).catch(() => {
      })
    },
    onMoveColumnLeft (col) {
      return this.$store.dispatch('classroom/moveCourseTestLeft', { id: col._test.id, course: this.selectedCourse })
    },
    onMoveColumnRight (col) {
      return this.$store.dispatch('classroom/moveCourseTestRight', { id: col._test.id, course: this.selectedCourse })
    },
    onScoreChange ($event, testId, studentId) {
      let newScore = parseFloat($event.target.value)
      return updateScoreByStudentAndTest(studentId, testId, newScore).then(result => {
        Vue.set(this.studentScores, `${studentId}-${testId}`, newScore)
      })
    },
    onScoreJumpPreColumn ($event) {
      let target = $event.target
      let td = target.parentNode
      let preTd = td.previousSibling
      if (!preTd || !preTd.classList.contains('score-input-td')) {
        let tds = td.parentNode.querySelectorAll('td.score-input-td')
        preTd = tds[tds.length - 1]
      }
      let input = preTd.querySelector(`input.score-input`)
      input.focus()
    },

    onScoreJumpNextColumn ($event) {
      let target = $event.target
      let td = target.parentNode
      let nextTd = td.nextSibling
      if (!nextTd || !nextTd.classList.contains('score-input-td')) {
        nextTd = td.parentNode.querySelector('td.score-input-td')
      }
      let input = nextTd.querySelector(`input.score-input`)
      input.focus()
    },
    onScoreJumpPreRow ($event) {
      let target = $event.target
      let tdIndex = target.parentNode.cellIndex
      let tr = target.parentNode.parentNode
      let preTr = tr.previousSibling
      if (!preTr) {
        preTr = tr.parentNode.querySelector('tr:last-child')
      }
      let input = preTr.querySelector(`td:nth-child(${tdIndex + 1}) input.score-input`)
      input.focus()
    },
    onScoreJumpNextRow ($event) {
      let target = $event.target
      let tdIndex = target.parentNode.cellIndex
      let tr = target.parentNode.parentNode
      let nextTr = tr.nextSibling
      if (!nextTr) {
        nextTr = tr.parentNode.querySelector('tr:first-child')
      }
      let input = nextTr.querySelector(`td:nth-child(${tdIndex + 1}) input.score-input`)
      input.focus()
    },
    onScoreKeyPress ($event) {
      if ($event.charCode > 57) {
        $event.preventDefault()
        return false
      }
      if ($event.charCode < 48 && $event.charCode !== 46) {
        $event.preventDefault()
        return false
      }
      if ([...$event.target.value.matchAll(/\./g)].length >= 1 && $event.charCode === 46) {
        let currentValue = parseFloat($event.target.value)
        $event.target.value = currentValue
        $event.preventDefault()
      }
    },
    onCourseChange (newCourse) {
      if (this.isLoading) {
        return false
      }
      this.isLoading = true
      let testIds = this.courseTests.map(test => test.id)
      return loadScoresByTests(testIds).then(result => {
        this.studentScores = {}
        result.forEach(item => {
          Vue.set(this.studentScores, `${item.studentId}-${item.testId}`, item.score)
        })
        this.isLoading = false
      }).catch(e => {
        this.studentScores = {}
        this.isLoading = false
      })
    },
    onToggleScoreInputButton () {
      this.isScoreInputting = !this.isScoreInputting
      if (this.isScoreInputting) {
        this.pagination.sortBy = false
      }
    }
  }
}
</script>

<style>
  .student-datatable {
    min-width: 600px;
  }

  .student-datatable .q-table-container thead tr:first-child th {
    position: sticky;
    top: 0;
    background: white;
    z-index: 1000;
    text-align: center;
  }

  .student-datatable .q-table-container .q-table-middle.scroll {
    max-height: calc(100vh - 250px);
  }

  .student-datatable .extra-top-row{
    position: fixed;
  }

  .student-datatable .score-input-td{
    padding: 0;
  }

  .student-datatable .score-input{
    border-left: 1px solid rgba(0,0,0,0.12);
    border-top: none;
    border-bottom: none;
    border-right: none;
    width: 100%;
    height: 100%;
    padding-right: 1em;
    text-align: right;
    display: flex;
  }

  .student-datatable .score-span{
    display: flex;
    justify-content: center;
  }
</style>
