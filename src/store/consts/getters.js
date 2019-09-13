/*
export function someGetter (state) {
}
*/
export function classroomGroupDirections (state) {
  return [
    {
      label: '第一组在最左',
      value: state.GROUP_DIRECTION_LR
    },
    {
      label: '第一组在最右',
      value: state.GROUP_DIRECTION_RL
    }
  ]
}

export function viewmodes (state) {
  return [
    { label: '座位图', icon: 'grid_on', value: state.VIEWMODE_GRID },
    { label: '表格', icon: 'table_chart', value: state.VIEWMODE_TABLE }
  ]
}

export function tableViews (state) {
  return [
    { label: '基本信息', value: state.TABLEVIEW_BASIC },
    { label: '成绩', value: state.TABLEVIEW_SCORE },
    { label: '出勤', value: state.TABLEVIEW_ACTIVITY },
    { label: '纪律', value: state.TABLEVIEW_DISCIPLINE }
  ]
}
