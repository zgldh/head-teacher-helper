import consts from '../consts/state'

export default {
  //
  nextNewStudentId: 1,
  viewMode: consts.VIEWMODE_GRID,
  classrooms: [],
  currentClassroom: {
    id: null,
    title: '',
    studentCount: 0,
    /**
     * {
     *  id: 123,                                          // 主键
     *  sno: 'abc123',                                    // 学号
     *  name:'',                                          // 名字
     *  seat: [rowIndex, colIndex],                       // 座位
     *  tags: ['tagA','tagB'],                            // 标签
     *  birthday: '2012-12-23',                           // 生日
     *  gender: 'male'|'female',                          // 性别
     *  positions: ['班长','英语课代表','体育委员','小组长']  // 学生岗位
     * }
     */
    students: [],
    /**
     * [  // Rows array
     *  [ // Row
     *    { // Column/Tile
       *      type: GRIDS_DESK|GRIDS_FLOOR,
       *      student: null,
       *      row: 0,
       *      col: 0
       *    },
     *    {
       *      type: GRIDS_DESK|GRIDS_FLOOR,
       *      student: null,
       *      row: 0,
       *      col: 1
       *    },
     *    ...
     *  ],
     *  ...
     * ]
     */
    grids: [],
    /**
     * [
     *  {
     *    type: GRIDS_DESK|GRIDS_FLOOR
     *    name: ''
     *  }
     * ]
     */
    gridsHead: [],
    groupDirection: '',
    seatsRules: {},
    positions: []
  },
  originalClassroom: {},
  editorStatus: 'disabled',

  layoutRightDrawerOpen: false,
  selectedStudent: null,

  EDITOR_STATUS_DISABLED: 'disabled',
  EDITOR_STATUS_DESK: 'desk',
  EDITOR_STATUS_SEAT: 'seat',

  tests: {
    chinese: [],
    mathematics: [],
    english: [],
    physics: [],
    chemistry: [],
    biology: [],
    ideological: [],
    social: [],
    nature: [],
    political: [],
    history: [],
    geographic: [],
    sports: [],
    computer: [],
    music: [],
    art: []
  },

  activities: []
}

export const ERROR_STUDENTS_IN_PLACE = 'ERROR_STUDENTS_IN_PLACE'
