<template>
  <q-page class="classroom-container flex flex-center"
          :class="{editor_status_desk:editorStatus===EDITOR_STATUS_DESK, editor_status_seat:editorStatus===EDITOR_STATUS_SEAT}">
    <div class="viewmode-desk-container">
      <desk-grids :grids="classroom.grids" :grids-groups="classroom.gridsHead"
                  :group-direction="classroom.groupDirection" :editor-status="editorStatus"
                  @insert-column="insertColumn" @insert-row="insertRow"
                  @remove-column="removeColumn" @remove-row="removeRow"
                  @tile-clicked="onTileClicked"
                  @move-student="onMoveStudent"
      ></desk-grids>
      <div class="classroom-platform">讲台</div>
    </div>
    <add-student-modal ref="addStudentModal"></add-student-modal>
  </q-page>
</template>

<script>
import DeskGrids from '../components/DeskGrids'
import { mapState } from 'vuex'
import AddStudentModal from '../components/modals/AddStudentModal'
import { ERROR_STUDENTS_IN_PLACE } from '../store/classroom/state'

export default {
  name: 'ClassroomGrid',
  components: {
    AddStudentModal,
    DeskGrids
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
    })
  },
  methods: {
    insertColumn (index) {
      this.$q.dialog({
        title: '插入一列什么？',
        message: '是一个小组还是一条过道？',
        options: {
          type: 'radio',
          model: this.GRIDS_DESK,
          items: [
            { label: '小组', value: this.GRIDS_DESK },
            { label: '过道', value: this.GRIDS_FLOOR }
          ]
        },
        cancel: true,
        preventClose: true,
        color: 'primary'
      }).then(data => {
        this.$store.commit('classroom/insertColumn', { index, type: data })
      }).catch(err => err)
    },
    insertRow (index) {
      this.$store.commit('classroom/insertRow', index)
    },
    removeColumn (index) {
      this.$store.dispatch('classroom/removeColumn', index).catch(err => {
        if (err === ERROR_STUDENTS_IN_PLACE) {
          return this.$q.dialog({
            title: `无法删除组`,
            message: '请先将本组的学生移动到其他组，或者删除掉。然后再删除组。',
            ok: {
              color: 'primary',
              label: '确定'
            },
            cancel: false,
            preventClose: true
          })
        }
      })
    },
    removeRow (index) {
      this.$store.dispatch('classroom/removeRow', index).catch(err => {
        if (err === ERROR_STUDENTS_IN_PLACE) {
          return this.$q.dialog({
            title: `无法删除这一排`,
            message: '请先将本排的学生移动到其他排，或者删除掉。然后再删除排。',
            ok: {
              color: 'primary',
              label: '确定'
            },
            cancel: false,
            preventClose: true
          })
        }
      })
    },
    onTileClicked ({ rowIndex, colIndex, type, student }) {
      if (this.editorStatus === this.EDITOR_STATUS_DESK) {
        // 座椅编辑模式
        if (student == null) {
          this.$store.commit('classroom/toggleClassroomTile', { rowIndex, colIndex })
        }
      } else if (type === this.GRIDS_DESK) {
        // 普通模式
        if (student == null) {
          // 录入学生
          this.$refs.addStudentModal.open({ rowIndex, colIndex })
        } else {
          // 选中学生
          this.$store.dispatch('classroom/selectStudent', student)
        }
      } else {
        // 点击地板
      }
    },
    onMoveStudent ({ student, sourceRow, sourceCol, targetRow, targetCol }) {
      this.$store.dispatch('classroom/moveStudent', { student, sourceRow, sourceCol, targetRow, targetCol })
    }
  }
}
</script>

<style>
  .classroom-container .viewmode-desk-container {
    display: flex;
    flex-direction: column;
    text-align: center;
  }

  .classroom-container.editor_status_desk {
    background: url('../statics/editor_status_desk_bg.png');
  }

  .classroom-container.editor_status_seat {
    background: url('../statics/editor_status_seat_bg.png');
  }

  .classroom-container .desk-grids {
    margin-top: 1em;
  }

  .classroom-platform {
    color: #2196f3;
    padding: 0.5em;
    font-size: 2em;
  }
</style>
