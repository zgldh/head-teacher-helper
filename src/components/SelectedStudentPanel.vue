<template>
  <div class="selected-student-panel">
    <q-list
      no-border
      link
      inset-delimiter
      v-if="selectedStudent"
    >
      <q-list-header class="justify-between">
        <div class="column">
          <div class="row items-baseline">
            <strong>{{studentName}}
              <q-icon name="edit" color="faded" size="14px"/>
              <q-popup-edit v-model="studentNameTemp" title="修改名字" buttons label-set="保存"
                            @show="studentNameTemp = studentName" @save="studentName = $event">
                <q-input type="text" v-model="studentNameTemp"/>
              </q-popup-edit>
            </strong>
            <span class="student-number">{{studentNumber}}  <q-icon name="edit"/>
              <q-popup-edit v-model="studentNumberTemp" title="修改学号" buttons label-set="保存"
                            @show="studentNumberTemp = studentNumber" @save="studentNumber = $event">
                <q-input type="text" v-model="studentNumberTemp"/>
              </q-popup-edit>
            </span>
          </div>
          <small>{{getReadableSeat({rowIndex:selectedStudent.seat[0],colIndex:selectedStudent.seat[1]})}}</small>
        </div>
        <q-btn-dropdown dense flat
                        icon="close"
                        split
                        label="关闭"
                        @click="close"
                        size="md">
          <!-- dropdown content -->
          <q-list link>
            <q-item @click.native="deleteStudent" v-close-overlay>
              <q-item-side color="negative" icon="delete_forever"/>
              <q-item-main>
                <q-item-tile text-color="negative" label>删除学生</q-item-tile>
              </q-item-main>
            </q-item>
          </q-list>
        </q-btn-dropdown>
      </q-list-header>
      <q-item-separator/>
      <q-item>
        <q-item-side>
          <q-item-tile label>性别</q-item-tile>
        </q-item-side>
        <q-item-main>
          <q-select hide-underline class="q-ma-none full-width" v-model="gender" :options="genders"/>
        </q-item-main>
      </q-item>
      <q-item-separator/>
      <q-item>
        <q-item-side>
          <q-item-tile label>生日</q-item-tile>
        </q-item-side>
        <q-item-main>
          <q-datetime v-model="birthday" type="date" hide-underline modal
                      :default-view="birthday?'day':'year'"
                      :default-value="getBirthdayDefaultValue()"/>
        </q-item-main>
      </q-item>
      <q-item-separator/>
      <q-item>
        <q-item-side>
          <q-item-tile label>岗位</q-item-tile>
        </q-item-side>
        <q-item-main>
          <q-select
            multiple
            chips
            readonly
            hide-underline
            placeholder="无"
            v-model="selectedStudent.positions"
            :options="classroomPositions"
          />
        </q-item-main>
        <q-item-side right>
          <q-btn flat round dense icon="edit" @click="onPositionsEdit"/>
        </q-item-side>
      </q-item>
      <q-item-separator/>
      <q-item>
        <q-item-side>
          <q-item-tile label>标签</q-item-tile>
        </q-item-side>
        <q-item-main>
          <q-chips-input readonly hide-underline :placeholder="tagsPlaceholder"
                         v-model="selectedStudent.tags"/>
        </q-item-main>
        <q-item-side right>
          <q-btn flat round dense icon="edit" @click="onTagsEdit"/>
        </q-item-side>
      </q-item>
      <q-item-separator/>
      <q-item>
        <q-item-side>
          <q-item-tile label>入学日期</q-item-tile>
        </q-item-side>
        <q-item-main>
          <q-datetime v-model="enrollmentDate" type="date" hide-underline modal
                      :default-view="enrollmentDate?'day':'year'"/>
        </q-item-main>
      </q-item>
    </q-list>
    <edit-student-positions-modal ref="EditStudentPositionsModal"/>
    <edit-student-tags-modal ref="EditStudentTagsModal"/>
  </div>
</template>

<script>
import { mapState, mapGetters } from 'vuex'
import EditStudentPositionsModal from './modals/EditStudentPositionsModal'
import EditStudentTagsModal from './modals/EditStudentTagsModal'

export default {
  name: 'SelectedStudentPanel',
  components: { EditStudentTagsModal, EditStudentPositionsModal },
  props: {},
  data () {
    return {
      studentNameTemp: '',
      studentNumberTemp: ''
    }
  },
  computed: {
    genders () {
      return this.$store.state.consts.GENDERS
    },
    studentName: {
      get () {
        return this.$store.state.classroom.selectedStudent.name
      },
      set (value) {
        if (value !== this.$store.state.classroom.selectedStudent.name) {
          this.$store.dispatch('classroom/setSelectedStudentProperty', { property: 'name', value })
        }
      }
    },
    studentNumber: {
      get () {
        return this.$store.state.classroom.selectedStudent.sno
      },
      set (value) {
        if (value !== this.$store.state.classroom.selectedStudent.sno) {
          this.$store.dispatch('classroom/setSelectedStudentProperty', { property: 'sno', value })
        }
      }
    },
    birthday: {
      get () {
        return this.$store.state.classroom.selectedStudent.birthday
      },
      set (value) {
        if (value !== this.$store.state.classroom.selectedStudent.birthday) {
          this.$store.dispatch('classroom/setSelectedStudentProperty', { property: 'birthday', value: value.substr(0, 10) })
        }
      }
    },
    gender: {
      get () {
        return this.$store.state.classroom.selectedStudent.gender
      },
      set (value) {
        this.$store.dispatch('classroom/setSelectedStudentProperty', { property: 'gender', value })
      }
    },
    enrollmentDate: {
      get () {
        return this.$store.state.classroom.selectedStudent.enrollmentDate
      },
      set (value) {
        if (value !== this.$store.state.classroom.selectedStudent.enrollmentDate) {
          this.$store.dispatch('classroom/setSelectedStudentProperty', { property: 'enrollmentDate', value: value.substr(0, 10) })
        }
      }
    },
    ...mapState({
      // ...
      selectedStudent: state => state.classroom.selectedStudent,
      classroomPositions: state => state.classroom.currentClassroom.positions
    }),
    ...mapGetters({
      getReadableSeat: 'classroom/getReadableSeat'
    }),
    tagsPlaceholder () {
      return this.selectedStudent.tags.length === 0 ? '无' : ''
    }
  },
  created () {
  },
  methods: {
    close () {
      this.$store.dispatch('classroom/cleanSelectedStudent')
    },
    deleteStudent () {
      alert('TODO deleteStudent')
    },
    onPositionsEdit () {
      this.$refs.EditStudentPositionsModal.open()
    },
    onTagsEdit () {
      this.$refs.EditStudentTagsModal.open()
    },
    getBirthdayDefaultValue () {
      const student = this.$store.state.classroom.currentClassroom.students.find(student => student.birthday)
      if (student) {
        return parseInt(student.birthday) + '-01-01'
      }
      return null
    }
  }
}
</script>

<style>
  .selected-student-panel {
  }

  .selected-student-panel .q-list-header {
    display: flex;
  }

  .selected-student-panel .q-list-header strong {
    color: black;
    line-height: 24px;
    font-size: 24px;
  }

  .selected-student-panel .q-list-header .student-number {
    margin-left: 8px;
  }
</style>
