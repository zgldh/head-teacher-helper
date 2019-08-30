<template>
  <div class="student-datatable">
    <q-table
      title="活动"
      :data="activityData"
      :columns="columns"
      :pagination.sync="pagination"
      :loading="isLoading"
      row-key="id"
    >
      <div slot="top-right" slot-scope="props" class="row">
        <q-btn icon="add" color="primary" :label="addActivityButtonLabel" @click="addActivity" />
        <q-btn icon="view_column" :color="columnsEditing?'green':''" flat @click="columnsEditing = !columnsEditing" />
        <q-btn icon="edit" :color="isActivityInputting?'green':''" flat @click="onToggleActivityInputButton" />
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
          <q-tooltip v-if="col._activity">{{ col._activity.date.toISOString().substr(0, 10) }}</q-tooltip>
        </q-th>
      </q-tr>

      <q-tr slot="body" slot-scope="props" :props="props">
        <q-td :props="props" key="sno">{{ props.row.sno }}</q-td>
        <q-td :props="props" key="name">{{ props.row.name }}</q-td>
        <q-td :props="props" v-for="activity in activities"
          :key="getActivityColumnName(activity.id)" class="activity-input-td">
          <input class="activity-input" type="text" :value="props.row[getActivityColumnName(activity.id)]"
            v-if="isActivityInputting"
            @change="onActivityChange($event, activity.id, props.row.id)" @focus="$event.target.select()"
            @keypress.exact="onActivityKeyPress($event)"
            @keypress.shift.enter="onActivityJumpNextRow($event)"
            @keypress.shift.j.prevent="onActivityJumpNextRow($event)"
            @keypress.shift.k.prevent="onActivityJumpPreRow($event)"
            @keypress.shift.h.prevent="onActivityJumpPreColumn($event)"
            @keypress.shift.l.prevent="onActivityJumpNextColumn($event)"
            />
          <span class="activity-span" v-else>{{props.row[getActivityColumnName(activity.id)]}}</span>
        </q-td>
      </q-tr>
    </q-table>
    <add-activity-modal ref="addActivityModal" />
  </div>
</template>

<script>
import { mapState, mapGetters } from 'vuex'
import addActivityModal from './modals/AddActivityModal'
import { loadActivities, updateActivityByStudentAndTest } from '../apis/offline'
import Vue from 'vue'

export default {
  name: 'StudentDataTableActivity',
  components: {
    addActivityModal
  },
  props: {},
  data () {
    return {
      isLoading: false,
      isActivityInputting: false,
      innerTableView: 'basic',
      pagination: {
        sortBy: null, // String, column "name" property value
        descending: false,
        page: 1,
        rowsPerPage: 0
      },
      columnsEditing: false,
      /**
       * {
       *  <studentId>: {
       *    <activityId>: 123,
       *    <activityId>: 456,
       *  },
       *  <studentId>: {
       *    <activityId>: 123,
       *    <activityId>: 456,
       *  }
       * }
       */
      studentActivities: {}
    }
  },
  computed: {
    ...mapState({
      classroom: state => state.classroom.currentClassroom,
      activities: state => state.classroom.activities.sort((a, b) => a.index - b.index),
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
    activityData () {
      return this.classroom.students.map(student => {
        let activities = {}
        this.activities.forEach(activity => {
          activities[this.getActivityColumnName(activity.id)] = this.studentActivities[`${student.id}-${activity.id}`]
        })
        return Object.assign({}, student, activities)
      })
    },
    columns () {
      let innerColumns = [
        {
          name: 'sno',
          required: true,
          label: '学号',
          align: 'left',
          field: 'sno',
          sortable: !this.isActivityInputting,
          classes: 'sno',
          style: ''
        },
        {
          name: 'name',
          required: true,
          label: '名字',
          align: 'left',
          field: 'name',
          sortable: !this.isActivityInputting,
          classes: 'name',
          style: ''
        }
      ]
      this.activities.forEach(activity => {
        innerColumns.push({
          name: this.getActivityColumnName(activity.id),
          required: true,
          label: activity.name,
          align: 'left',
          field: this.getActivityColumnName(activity.id),
          sortable: !this.isActivityInputting,
          classes: 'activity',
          style: 'width:100px',
          _activity: activity
        })
      })
      return innerColumns
    },
    addActivityButtonLabel () {
      return `添加活动`
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
  },
  created () {
  },
  mounted () {
  },
  methods: {
    getActivityColumnName (activityId) {
      return `activity-${activityId}`
    },
    addActivity () {
      this.$refs['addActivityModal'].open(this.addActivityButtonLabel)
        .then(result => {
          return this.$store.dispatch('classroom/addActivity', result)
        }).catch(err => {
          console.log(err)
        })
    },
    onEditColumnClick (col) {
      this.$refs['addActivityModal'].open(`编辑“${col.label}”活动`,
        col._activity.name,
        col._activity.date)
        .then(result => {
          return this.$store.dispatch('classroom/updateActivity', {
            id: col._activity.id,
            name: result.name,
            date: result.date,
            index: col._activity.index })
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
        await this.$store.dispatch('classroom/deleteActivity', { id: col._activity.id })
      }).catch(() => {
      })
    },
    onMoveColumnLeft (col) {
      return this.$store.dispatch('classroom/moveActivityLeft', { id: col._activity.id })
    },
    onMoveColumnRight (col) {
      return this.$store.dispatch('classroom/moveActivityRight', { id: col._activity.id })
    },
    onActivityChange ($event, activityId, studentId) {
      let newActivity = parseFloat($event.target.value)
      return updateActivityByStudentAndTest(studentId, activityId, newActivity).then(result => {
        Vue.set(this.studentActivities, `${studentId}-${activityId}`, newActivity)
      })
    },
    onActivityJumpPreColumn ($event) {
      let target = $event.target
      let td = target.parentNode
      let preTd = td.previousSibling
      if (!preTd || !preTd.classList.contains('activity-input-td')) {
        let tds = td.parentNode.querySelectorAll('td.activity-input-td')
        preTd = tds[tds.length - 1]
      }
      let input = preTd.querySelector(`input.activity-input`)
      input.focus()
    },

    onActivityJumpNextColumn ($event) {
      let target = $event.target
      let td = target.parentNode
      let nextTd = td.nextSibling
      if (!nextTd || !nextTd.classList.contains('activity-input-td')) {
        nextTd = td.parentNode.querySelector('td.activity-input-td')
      }
      let input = nextTd.querySelector(`input.activity-input`)
      input.focus()
    },
    onActivityJumpPreRow ($event) {
      let target = $event.target
      let tdIndex = target.parentNode.cellIndex
      let tr = target.parentNode.parentNode
      let preTr = tr.previousSibling
      if (!preTr) {
        preTr = tr.parentNode.querySelector('tr:last-child')
      }
      let input = preTr.querySelector(`td:nth-child(${tdIndex + 1}) input.activity-input`)
      input.focus()
    },
    onActivityJumpNextRow ($event) {
      let target = $event.target
      let tdIndex = target.parentNode.cellIndex
      let tr = target.parentNode.parentNode
      let nextTr = tr.nextSibling
      if (!nextTr) {
        nextTr = tr.parentNode.querySelector('tr:first-child')
      }
      let input = nextTr.querySelector(`td:nth-child(${tdIndex + 1}) input.activity-input`)
      input.focus()
    },
    onActivityKeyPress ($event) {
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
    onToggleActivityInputButton () {
      this.isActivityInputting = !this.isActivityInputting
      if (this.isActivityInputting) {
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

  .student-datatable .activity-input-td{
    padding: 0;
  }

  .student-datatable .activity-input{
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

  .student-datatable .activity-span{
    display: flex;
    justify-content: center;
  }
</style>
