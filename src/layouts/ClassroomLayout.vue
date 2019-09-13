<template>
  <q-layout class="classroom-layout" view="hHh LpR fFf">
    <q-layout-header>
      <q-toolbar
        color="white" text-color="blue-6"
        :inverted="$q.theme === 'ios'"
      >
        <q-toolbar-title>
          <q-btn
            size="lg"
            flat
            dense
            @click="editClassroomTitle"
            aria-label="编辑班级名字"
          >
            <span>{{classroom.title}}</span>
            <q-icon class="q-ml-sm" size="16px" name="edit"/>
          </q-btn>
          <q-btn
            size="md"
            flat
            dense
            @click="editClassroomDuration"
            aria-label="编辑学年时间"
          >
            <span>{{classroom.beginDate}} - {{classroom.graduateDate}}</span>
            <q-icon class="q-ml-sm" size="16px" name="edit"/>
          </q-btn>
        </q-toolbar-title>
        <span class="editor-status" v-if="editorStatus==EDITOR_STATUS_DESK"><span>正在修改座椅布局</span>
          <q-btn class="q-mr-sm" dense flat color="positive" @click="saveDeskArrangement" icon="done" label="保存"/>
          <q-btn dense flat color="negative" @click="cancelDeskArrangement" icon="cancel" label="取消"/>
        </span>
        <span class="editor-status" v-else-if="editorStatus==EDITOR_STATUS_SEAT"><span>正在管理学生</span>
          <q-btn class="q-mr-sm" color="positive" dense flat @click="saveStudentsSeat" icon="done" label="保存"/>
          <q-btn color="negative" dense flat @click="cancelStudentsSeat" icon="cancel" label="取消"/>
        </span>
        <div class="tools" v-else>
          <q-btn flat @click="addStudents" icon="group_add" label="录入学生"/>
          <q-btn-dropdown class="q-btn-flat" :disabled="viewMode === VIEWMODE_TABLE" label="调整座位">
            <!-- dropdown content -->
            <q-list link>
              <q-item @click.native="editDeskArrangement" v-close-overlay>
                <q-item-side icon="grid_on"></q-item-side>
                <q-item-main label="修改布局">
                </q-item-main>
              </q-item>
              <q-item-separator></q-item-separator>
              <!--<q-item @click.native="clickedSeatsRules" v-close-overlay>-->
              <!--<q-item-side icon="settings"></q-item-side>-->
              <!--<q-item-main label="设定规则">-->
              <!--</q-item-main>-->
              <!--</q-item>-->
              <!--<q-item-separator></q-item-separator>-->
              <q-item @click.native="clickedSeatsShuffle" v-close-overlay>
                <q-item-side icon="shuffle"></q-item-side>
                <q-item-main label="完全随机">
                </q-item-main>
              </q-item>
              <q-item @click.native="clickedSeatsPanLeft" v-close-overlay>
                <q-item-side icon="arrow_back"></q-item-side>
                <q-item-main label="向左平移">
                </q-item-main>
              </q-item>
              <q-item @click.native="clickedSeatsPanRight" v-close-overlay>
                <q-item-side icon="arrow_forward"></q-item-side>
                <q-item-main label="向右平移">
                </q-item-main>
              </q-item>
              <q-item @click.native="clickedSeatsPanFront" v-close-overlay>
                <q-item-side icon="arrow_downward"></q-item-side>
                <q-item-main label="向前平移">
                </q-item-main>
              </q-item>
              <q-item @click.native="clickedSeatsPanBackward" v-close-overlay>
                <q-item-side icon="arrow_upward"></q-item-side>
                <q-item-main label="向后平移">
                </q-item-main>
              </q-item>
            </q-list>
          </q-btn-dropdown>
        </div>
        <q-btn
          flat
          @click="backToClassroomList"
          aria-label="返回班级列表"
          :disable="editorStatus!==EDITOR_STATUS_DISABLED"
        >
          <q-icon name="keyboard_backspace"/>
          返回班级列表
        </q-btn>
      </q-toolbar>
    </q-layout-header>

    <q-page-container>
      <router-view/>
    </q-page-container>

    <q-layout-drawer
      side="right"
      v-model="rightDrawerOpen"
      :content-class="$q.theme === 'mat' ? 'bg-grey-2' : null"
    >
      <selected-student-panel v-if="classroom"/>
    </q-layout-drawer>

    <q-page-sticky class="q-ma-md" position="top-left" v-if="editorStatus===EDITOR_STATUS_DISABLED">
      <q-btn-toggle
        v-model="viewMode"
        toggle-color="primary"
        :options="viewmodes"
      />
    </q-page-sticky>

    <q-page-sticky class="page-sticky-panel" position="top-left" :offset="[18, 18]"
                   v-if="editorStatus===EDITOR_STATUS_DESK">
      <q-select
        v-model="groupDirection"
        float-label="小组顺序"
        :options="classroomGroupDirections"
      />
    </q-page-sticky>

    <note-modal ref="noteModal"><p>{{noteModalText}}</p></note-modal>
    <add-students-modal ref="addStudentsModal"></add-students-modal>
    <edit-classroom-duration-modal ref="editClassroomDurationModal"></edit-classroom-duration-modal>
  </q-layout>
</template>

<script>
import { openURL, Notify } from 'quasar'
import { mapState, mapGetters } from 'vuex'
import NoteModal from '../components/modals/NoteModal'
import AddStudentsModal from '../components/modals/AddStudentsModal'
import SelectedStudentPanel from '../components/SelectedStudentPanel'
import EditClassroomDurationModal from '../components/modals/EditClassroomDurationModal'

export default {
  name: 'ClassroomLayout',
  components: { SelectedStudentPanel, AddStudentsModal, NoteModal, EditClassroomDurationModal },
  data () {
    return {
      noteModalText: '',
      previousNotification: null
    }
  },
  computed: {
    viewMode: {
      get () {
        return this.$store.state.classroom.viewMode
      },
      set (value) {
        this.$store.dispatch('classroom/setViewMode', value)
        this.$router.push({ path: `/classroom/${this.$store.state.classroom.currentClassroom.id}/${value}` })
      }
    },
    groupDirection: {
      get () {
        return this.$store.state.classroom.currentClassroom.groupDirection
      },
      set (value) {
        this.$store.dispatch('classroom/changeClassroomGroupDirection', value)
      }
    },
    rightDrawerOpen: {
      get () {
        return this.$store.state.classroom.layoutRightDrawerOpen
      },
      set (value) {
        if (!value) {
          this.$store.dispatch('classroom/cleanSelectedStudent')
        }
      }
    },
    ...mapState({
      // ...
      classroom: state => state.classroom.currentClassroom,
      editorStatus: state => state.classroom.editorStatus,
      EDITOR_STATUS_DISABLED: state => state.classroom.EDITOR_STATUS_DISABLED,
      EDITOR_STATUS_DESK: state => state.classroom.EDITOR_STATUS_DESK,
      EDITOR_STATUS_SEAT: state => state.classroom.EDITOR_STATUS_SEAT,
      VIEWMODE_GRID: state => state.consts.VIEWMODE_GRID,
      VIEWMODE_TABLE: state => state.consts.VIEWMODE_TABLE
    }),
    ...mapGetters({
      classroomGroupDirections: 'consts/classroomGroupDirections',
      viewmodes: 'consts/viewmodes'
    })
  },
  mounted () {
    this.$store.dispatch('classroom/cleanSelectedStudent')
  },
  // beforeRouteUpdate: (to, from, next) => {
  //   this.loadClassroom(to.params.classroomId).then(next)
  // },
  beforeRouteEnter: (to, from, next) => {
    // ...
    next(vm => {
      vm.loadClassroom(to.params.classroomId)
    })
  },
  methods: {
    openURL,
    loadClassroom (classroomId) {
      return this.$store.dispatch('classroom/loadClassroom', classroomId)
        .catch(err => {
          console.log(err)
          return this.$q.dialog({
            title: `班级不存在`,
            message: '您要查看的班级不存在，接下来返回首页。',
            ok: {
              color: 'primary',
              label: '确定'
            },
            cancel: false,
            preventClose: true
          }).then(() => {
            this.$router.push('/')
          })
        })
    },
    backToClassroomList () {
      this.$router.push({ path: '/' })
    },
    editClassroomTitle () {
      this.$q.dialog({
        title: '编辑班级名字',
        message: '起个好听的名字吧。',
        prompt: {
          model: this.classroom.title,
          type: 'text' // optional
        },
        ok: {
          color: 'primary'
        },
        cancel: true,
        color: 'primary'
      }).then(data => {
        if (data !== this.classroom.title) {
          this.$store.dispatch('classroom/changeClassroomTitle', { classroomId: this.classroom.id, title: data })
        }
      }).catch(() => {
      })
    },
    editClassroomDuration () {
      this.$refs.editClassroomDurationModal.open()
    },
    editDeskArrangement () {
      this.noteModalText = '您可以点击屏幕中的方格，来调整教室内座椅的布局。'
      this.$refs.noteModal.open()
      this.$store.dispatch('classroom/cleanSelectedStudent')
      this.$store.commit('classroom/changeEditorStatus', this.EDITOR_STATUS_DESK)
    },
    editStudentsSeat () {
      this.noteModalText = '可以拖拽学生来调整座位。'
      this.$refs.noteModal.open()
      this.$store.commit('classroom/changeEditorStatus', this.EDITOR_STATUS_SEAT)
    },
    addStudents () {
      this.$refs.addStudentsModal.open(this.$store.getters['classroom/emptyDeskCount']())
    },
    saveDeskArrangement () {
      this.$store.dispatch('classroom/saveDeskArrangement')
    },
    cancelDeskArrangement () {
      this.$store.commit('classroom/changeEditorStatus', this.EDITOR_STATUS_DISABLED)
    },
    saveStudentsSeat () {
      this.$store.commit('classroom/changeEditorStatus', this.EDITOR_STATUS_DISABLED)
    },
    cancelStudentsSeat () {
      this.$store.commit('classroom/changeEditorStatus', this.EDITOR_STATUS_DISABLED)
    },
    clickedSeatsRules () {
      /**
       * TODO 设定座位规则
       * 元规则：
       * 1. SeatRuleReservation 某座位留空、只为某个/某几个学生预留
       * 2. SeatRuleStudentsDistance 某学生A和某学生B的座位距离必须为：0（不限），1（挨着），2（隔一个，对角），3（隔两个或以上）
       * 扩展规则：
       * 1. SeatRuleStudentReservation 某学生只坐在设定的某个/某几个座位上 可
       * 2. SeatRuleStudentsDeskMate 某两个学生必定同桌/前后卓
       * 3. SeatRuleStudentsBreakUp 某两个学生必须不能同桌/同组/前后桌
       * 4. SeatRuleCadreCover 每一组必须有个班干部
       */
      alert('TODO clickedSeatsRules')
    },
    clickedSeatsShuffle () {
      this.$store.dispatch('classroom/seatsShuffle')
      this.ShowCancelableNotification()
    },
    clickedSeatsPanLeft () {
      this.$store.dispatch('classroom/seatsPanLeft')
      this.ShowCancelableNotification()
    },
    clickedSeatsPanRight () {
      this.$store.dispatch('classroom/seatsPanRight')
      this.ShowCancelableNotification()
    },
    clickedSeatsPanFront () {
      this.$store.dispatch('classroom/seatsPanFront')
      this.ShowCancelableNotification()
    },
    clickedSeatsPanBackward () {
      this.$store.dispatch('classroom/seatsPanBackward')
      this.ShowCancelableNotification()
    },
    ShowCancelableNotification () {
      if (this.previousNotification) {
        this.previousNotification()
      }
      this.previousNotification = Notify.create({
        // only required parameter is the message:
        message: `调整完毕`,

        /*
         * All parameters below are optional:
         */

        timeout: 3000, // in milliseconds; 0 means no timeout

        // "type" adds a color and icon,
        // so you don't need to specify them.
        // Available values: 'positive', 'negative', 'warning', 'info'
        type: 'positive',

        color: 'positive',
        textColor: 'white', // if default 'white' doesn't fit

        icon: 'done',

        detail: '',
        position: 'top', // 'top', 'left', 'bottom-left' etc.

        closeBtn: false, // or string as button message e.g. 'dismiss'

        actions: [
          {
            label: '撤销',
            icon: 'undo', // optional
            handler: () => {
              this.$store.commit('classroom/restoreOriginalClassroom')
            }
          }
        ]
      })
    }
  }
}
</script>

<style>
  .classroom-layout {
  }

  .classroom-layout .editor-status {
    flex: 1;
    text-align: center;
  }

  .classroom-layout .editor-status > span {
    margin-right: 0.5em;
  }

  .classroom-layout .q-layout-header .q-toolbar .q-toolbar-title {
    max-width: 400px;
  }

  .classroom-layout .q-layout-header .q-toolbar .tools {
    flex: 1
  }
</style>
