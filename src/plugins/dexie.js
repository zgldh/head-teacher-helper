// import something here
import Dexie from 'dexie'

// leave the export, even if you don't use it
export default ({ app, router, Vue }) => {
  // something to do
  var db = new Dexie('HeadTeacherHelperDatabase')
  db.version(1).stores({
    /**
     * id: '1234567890',
     * title: '',
     * grids： [  // Rows array
     *  [ // Row
     *    { // Column/Tile
      *      type: GRIDS_DESK|GRIDS_FLOOR,
      *      row: 0,
      *      col: 0
      *    },
     *    {
       *      type: GRIDS_DESK|GRIDS_FLOOR,
       *      row: 0,
       *      col: 1
       *    },
     *    ...
     *  ],
     *  ...
     * ]
    gridsHead: [
     *  {
     *    type: GRIDS_DESK|GRIDS_FLOOR
     *    name: ''
     *  }
     * ]
    groupDirection: '', // GROUP_DIRECTION_LR: 'lr',| GROUP_DIRECTION_RL: 'rl',
    seatsRules: {},
    positions: []
     */
    classrooms: 'id',
    /**
     *  id: 123,                                          // 主键
     *  classroomId: 45671234567                          // Refer to db.classrooms.id
     *  sno: 'abc123',                                    // 学号
     *  name:'',                                          // 名字
     *  seat: [rowIndex, colIndex],                       // 座位
     *  tags: ['tagA','tagB'],                            // 标签
     *  birthday: '2012-12-23',                           // 生日
     *  gender: 'male'|'female',                          // 性别
     *  positions: ['班长','英语课代表','体育委员','小组长']  // 学生岗位
     */
    students: '++id,classroomId,sno',
    tests: '++id, course, classroomId',
    scores: '++id,studentId,testId, score'
  })
  db.version(2).stores({
    scores: '++id,studentId,classroomId,testId,score'
  })
  db.version(2.1).stores({
    scores: '++id,studentId,classroomId,testId,score,[studentId+testId]'
  })
  db.version(3).stores({
    activities: '++id, classroomId',
    actions: '++id, studentId, classroomId, activityId'
  })
  Vue.prototype.$dexie = db
}
