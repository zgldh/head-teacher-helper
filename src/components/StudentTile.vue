<template>
  <div class="student-tile">{{student.name}}</div>
</template>
<script>
export default {
  name: 'StudentTile',
  data () {
    return {}
  },
  props: {
    student: Object,
    rowIndex: {
      type: Number,
      default: 0
    },
    colIndex: {
      type: Number,
      default: 0
    }
  },
  computed: {},
  methods: {
    tileClicked () {
      this.$emit('student-tile-clicked', {
        rowIndex: this.rowIndex,
        colIndex: this.colIndex,
        student: this.student
      })
    }
  }
}
</script>

<style lang="stylus">
  .student-tile {
    color: white;
    background: #2a3c73;
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
</style>
