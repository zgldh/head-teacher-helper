<template>
  <q-btn class="desk-grid-tile" :class="deskData.type" flat dense @click="tileClicked"
         :row-index="rowIndex" :col-index="colIndex">
    <student-tile v-if="deskData.student" :class="{selected:deskData.student === selectedStudent}"
                  :student="deskData.student" :row-index="rowIndex" :col-index="colIndex"></student-tile>
  </q-btn>
</template>

<script>
import { mapState } from 'vuex'
import StudentTile from './StudentTile'

export default {
  name: 'DeskGridTile',
  components: { StudentTile },
  data () {
    return {}
  },
  props: {
    deskData: Object,
    editorStatus: {
      type: String,
      default: 'disabled'
    },
    rowIndex: {
      type: Number,
      default: 0
    },
    colIndex: {
      type: Number,
      default: 0
    }
  },
  computed: {
    ...mapState({
      // ...
      selectedStudent: state => state.classroom.selectedStudent,
      EDITOR_STATUS_DISABLED: state => state.classroom.EDITOR_STATUS_DISABLED,
      EDITOR_STATUS_DESK: state => state.classroom.EDITOR_STATUS_DESK,
      EDITOR_STATUS_SEAT: state => state.classroom.EDITOR_STATUS_SEAT
    })
  },
  methods: {
    tileClicked () {
      this.$emit('tile-clicked', {
        rowIndex: this.rowIndex,
        colIndex: this.colIndex,
        type: this.deskData.type,
        student: this.deskData.student
      })
    }
  }
}
</script>

<style lang="stylus">
  .desk-grid-tile {
    position: relative;
  }

  .desk-grid-tile:hover {
  }

  .desk-grid-tile.desk {
    background: #FFA000;
  }

  .desk-grid-tile.floor {
    background: #f8f8f8;
  }

  .desk-grid-tile .student-tile {
    position: absolute;
    top: -1px;
    left: -1px;
    border-radius: 3px;
  }

  .desk-grid-tile .student-tile.selected {
    border: 2px solid #32fd25;
    background: green;
  }
</style>
