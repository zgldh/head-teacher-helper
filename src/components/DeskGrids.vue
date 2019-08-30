<template>
  <div class="desk-grids" :class="{desk:editorStatus===EDITOR_STATUS_DESK, seat:editorStatus===EDITOR_STATUS_SEAT}">
    <div class="desk-grids-container">
      <div class="desk-column-buttons" v-if="editorStatus===EDITOR_STATUS_DESK">
        <div class="insert-column-button"></div>
        <q-btn v-for="(groupItem, $groupIndex) in gridsGroups" :key="$groupIndex"
               class="insert-column-button" text-color="primary" flat round dense @click="insertColumn($groupIndex)"
               icon="expand_more" label="插入一组">
          <q-tooltip>插入一组</q-tooltip>
        </q-btn>
        <q-btn class="insert-column-button" text-color="primary" flat round dense
               @click="insertColumn(gridsGroups.length)"
               icon="expand_more" label="插入一组">
          <q-tooltip>插入一组</q-tooltip>
        </q-btn>
        <div class="insert-column-button"></div>
      </div>
    </div>
    <div class="desk-row-head">
      <q-btn v-if="editorStatus===EDITOR_STATUS_DESK"
             class="insert-row-button" text-color="primary" flat round dense @click="insertRow(0)"
             icon="chevron_right" label="插入一排">
        <q-tooltip anchor="center left" self="center right">插入一排</q-tooltip>
      </q-btn>
      <div class="desk-grid-tile"></div>
      <q-btn class="desk-grid-tile column-handler" :class="groupItem" v-for="(groupItem, $groupIndex) in gridsGroups"
             :key="$groupIndex" flat dense @click="removeColumn($groupIndex)">{{groupItem.name}}
      </q-btn>
      <div class="desk-grid-tile"></div>
      <q-btn v-if="editorStatus===EDITOR_STATUS_DESK"
             class="insert-row-button" text-color="primary" flat round dense @click="insertRow(0)"
             icon="chevron_left" label="插入一排">
        <q-tooltip anchor="center right" self="center left">插入一排</q-tooltip>
      </q-btn>
    </div>
    <div class="desk-row" v-for="(rowData,$rowIndex) in grids" :key="$rowIndex">
      <q-btn v-if="editorStatus===EDITOR_STATUS_DESK"
             class="insert-row-button" text-color="primary" flat round dense @click="insertRow($rowIndex+1)"
             icon="chevron_right" label="插入一排座椅">
        <q-tooltip anchor="center left" self="center right">插入一排座椅</q-tooltip>
      </q-btn>
      <q-btn flat dense class="row-handler desk-grid-tile" @click="removeRow($rowIndex)">{{getRowName($rowIndex)}}
      </q-btn>
      <draggable class="row-draggable"
                 group="students"
                 :list="rowData"
                 handle=".student-tile"
                 :invertSwap="true"
                 :empty-insert-threshold="10"
                 @start="onDragStart"
                 @end="onDragEnd"
                 :move="onDragMove">
        <desk-grid-tile v-for="(deskData, $deskIndex) in rowData" :key="$deskIndex"
                        :class="{'dragging-over':$rowIndex === draggingContext.targetRow && $deskIndex === draggingContext.targetCol }"
                        :desk-data="deskData" :row-index="$rowIndex" :col-index="$deskIndex"
                        :editor-status="editorStatus"
                        @tile-clicked="onTileClicked"></desk-grid-tile>
      </draggable>
      <q-btn flat dense class="row-handler desk-grid-tile" @click="removeRow($rowIndex)">{{getRowName($rowIndex)}}
      </q-btn>
      <q-btn v-if="editorStatus===EDITOR_STATUS_DESK"
             class="insert-row-button" text-color="primary" flat round dense @click="insertRow($rowIndex+1)"
             icon="chevron_left" label="插入一排座椅">
        <q-tooltip anchor="center right" self="center left">插入一排座椅</q-tooltip>
      </q-btn>
    </div>
  </div>
</template>

<script>
import draggable from 'vuedraggable'
import DeskGridTile from '../components/DeskGridTile'
import { mapState } from 'vuex'
import _ from 'lodash'

export default {
  name: 'DeskGrid',
  components: {
    DeskGridTile,
    draggable
  },
  props: {
    grids: Array,
    gridsGroups: Array,
    groupDirection: {
      type: String,
      default: 'lr'
    },
    editorStatus: {
      type: String,
      default: 'disabled'
    }
  },
  data () {
    return {
      drag: false,
      draggingContext: {
        student: null,
        sourceRow: null,
        sourceCol: null,
        targetRow: null,
        targetCol: null
      }
    }
  },
  computed: {
    ...mapState({
      // ...
      GRIDS_DESK: state => state.consts.GRIDS_DESK,
      GRIDS_FLOOR: state => state.consts.GRIDS_FLOOR,
      EDITOR_STATUS_DISABLED: state => state.classroom.EDITOR_STATUS_DISABLED,
      EDITOR_STATUS_DESK: state => state.classroom.EDITOR_STATUS_DESK,
      EDITOR_STATUS_SEAT: state => state.classroom.EDITOR_STATUS_SEAT
    })
  },
  created () {
  },
  methods: {
    resetDraggingContext () {
      this.draggingContext = {
        student: null,
        sourceRow: null,
        sourceCol: null,
        targetRow: null,
        targetCol: null
      }
    },
    getRowName (rowIndex) {
      return `${this.grids.length - rowIndex}排`
    },
    insertColumn (index) {
      this.$emit('insert-column', index)
    },
    insertRow (index) {
      this.$emit('insert-row', index)
    },
    removeColumn (index) {
      if (this.editorStatus === this.EDITOR_STATUS_DESK) {
        let title, message
        if (this.gridsGroups[index].type === this.$store.state.consts.GRIDS_FLOOR) {
          title = `确定要删除过道么？`
          message = `请放心删除`
        } else if (this.gridsGroups[index].type === this.$store.state.consts.GRIDS_DESK) {
          title = `确定要删除 “${this.gridsGroups[index].name}” 么？`
          message = `本组必须没有学生才能被删除。`
        }
        this.$q.dialog({
          title: title,
          message: message,
          ok: {
            color: 'red',
            label: '删除'
          },
          cancel: '算了'
        }).then(async () => {
          this.$emit('remove-column', index)
        }).catch(() => {
        })
      }
    },
    removeRow (index) {
      if (this.editorStatus === this.EDITOR_STATUS_DESK) {
        this.$q.dialog({
          title: `确定要删除 “${this.getRowName(index)}” 吗？`,
          message: '本排必须没有学生才能被删除。',
          ok: {
            color: 'red',
            label: '删除'
          },
          cancel: '算了'
        }).then(async () => {
          this.$emit('remove-row', index)
        }).catch(() => {
        })
      }
    },
    onTileClicked (context) {
      this.$emit('tile-clicked', context)
    },
    onDragStart (evt) {
      this.drag = true
    },
    onDragEnd (evt) {
      this.drag = false
      let evtOriginalTarget = evt.originalEvent.target
      if (evt.item === evtOriginalTarget.parentNode.parentNode) {
        this.resetDraggingContext()
      } else if (parseInt(evtOriginalTarget.attributes['col-index'].value) !== this.draggingContext.targetCol ||
        parseInt(evtOriginalTarget.attributes['row-index'].value) !== this.draggingContext.targetRow) {
        this.resetDraggingContext()
      }
      // switch evt.draggedContext and evt.relatedContext
      if (this.draggingContext.sourceRow === null ||
        this.draggingContext.sourceCol === null ||
        this.draggingContext.targetRow === null ||
        this.draggingContext.targetCol === null) {
        return false
      }
      const payload = JSON.parse(JSON.stringify(this.draggingContext))
      this.$emit('move-student', payload)
      this.resetDraggingContext()
    },
    onDragMove: _.throttle(function (evt, originalEvent) {
      if (this.drag === false) {
        return false
      }
      if (evt.relatedContext.element.type === this.GRIDS_FLOOR) {
        return false
      }
      if (!this.draggingContext.student) {
        this.draggingContext.student = evt.draggedContext.element.student
      }
      if (!this.draggingContext.student) {
        return false
      }
      if (!this.draggingContext.sourceRow) {
        this.draggingContext.sourceRow = this.draggingContext.student.seat[0]
        this.draggingContext.sourceCol = this.draggingContext.student.seat[1]
      }
      const targetRow = evt.relatedContext.element.row
      const targetCol = evt.relatedContext.element.col
      if (this.draggingContext.targetRow === targetRow && this.draggingContext.targetCol === targetCol) {
        return false
      }
      this.draggingContext.targetRow = targetRow
      this.draggingContext.targetCol = targetCol
      return false
    }, 500)
  }
}
</script>

<style>
  .desk-grids {
  }

  .desk-grids.desk {
    border-radius: 1em;
    background: white;
    padding-bottom: 2em;
  }

  .desk-grids.seat {
    border-radius: 1em;
    background: white;
    padding: 1em;
  }

  .desk-grids.desk {
    border-radius: 1em;
    background: white;
    padding-bottom: 2em;
  }

  .desk-grids-container {
    display: flex;
    flex-direction: column;
  }

  .desk-row-head {
  }

  .desk-grids .desk-grid-tile {
    display: block;
    width: 50px;
    height: 50px;
    margin: 1px;
    padding-top: 0.5em;
    text-align: center;
    line-height: 14px;
    user-select: none;
    font-size: 14px;
  }

  .desk-grids .desk-grid-tile.dragging-over {
    border: 2px solid #027be3;
    padding: 2px;
    background: transparent;
    -webkit-transition: none;
    -moz-transition: none;
    -ms-transition: none;
    -o-transition: none;
    transition: none;
  }

  .desk-grids .desk-grid-tile.dragging-over .student-tile {
    background: #fff;
    color: #027be3;
    left: -3px;
    top: -3px;
    z-index: -1;
  }

  .desk-grids .desk-grid-tile.sortable-chosen {
    opacity: 0.75;
    -webkit-transition: none;
    -moz-transition: none;
    -ms-transition: none;
    -o-transition: none;
    transition: none;
    -webkit-box-shadow: 2px 2px 5px 1px #999;
    -moz-box-shadow: 2px 2px 5px 1px #999;
    box-shadow: 2px 2px 5px 1px #999;
    -webkit-transform: translateX(-2px) translateY(-2px);
    -moz-transform: translateX(-2px) translateY(-2px);
    -ms-transform: translateX(-2px) translateY(-2px);
    -o-transform: translateX(-2px) translateY(-2px);
    transform: translateX(-2px) translateY(-2px);
  }

  .desk-row-head > .column-handler {
    color: #2196f3;
  }

  .desk-row, .row-handler {
    color: #2196f3;
  }

  .desk-row, .desk-row-head {
    display: flex;
    flex-direction: row;
  }

  .desk-row .row-draggable {
    display: flex;
  }

  .desk-grids .insert-row-button {
    position: relative;
    top: 36px;
  }

  .desk-grids .insert-column-button {
    position: relative;
    display: inline-block;
    left: 18px;
    margin: 0 18px 0 0;
    width: 34px;
  }
</style>
