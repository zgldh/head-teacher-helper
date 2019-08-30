/*
export function someGetter (state) {
}
*/
import { uid } from 'quasar'
import consts from '../consts/state'

export function generateNewClassroom (state, getters, rootState) {
  return () => {
    let classroom = {
      id: uid(),
      title: '新班级',
      studentCount: 0,
      /**
       * {
       *  id: 123,                                          // 主键
       *  sno: 'abc123',                                    // 学号
       *  name:'',
       *  seat: [rowIndex, colIndex]
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
      grids: getters['generateDeskGrids'](),
      groupDirection: rootState.consts.GROUP_DIRECTION_LR
    }
    /**
     * [
     *  {
     *    type: GRIDS_DESK|GRIDS_FLOOR
     *    name: ''
     *  }
     * ]
     */
    classroom.gridsHead = getters['generateDeskGridsHead'](classroom.grids[0].map(item => item.type), classroom.groupDirection)
    classroom.positions = JSON.parse(JSON.stringify(rootState.consts.POSITIONS))
    return classroom
  }
}

/**
 * [
 *  [
 *    {
 *      type: GRIDS_DESK|GRIDS_FLOOR,
 *      student: null
 *    },
 *    {
 *      type: GRIDS_DESK|GRIDS_FLOOR,
 *      student: null
 *    },
 *    ...
 *  ],
 *  ...
 * ]
 * @param state
 * @param getters
 * @param rootState
 * @returns {function(*=, *=): Array}
 */
export function generateDeskGrids (state, getters, rootState) {
  return (rowPattern, rows) => {
    rowPattern = rowPattern || [
      rootState.consts.GRIDS_DESK,
      rootState.consts.GRIDS_DESK,
      rootState.consts.GRIDS_FLOOR,
      rootState.consts.GRIDS_DESK,
      rootState.consts.GRIDS_DESK,
      rootState.consts.GRIDS_DESK,
      rootState.consts.GRIDS_DESK,
      rootState.consts.GRIDS_FLOOR,
      rootState.consts.GRIDS_DESK,
      rootState.consts.GRIDS_DESK
    ]
    rows = rows || 8
    let grids = [], row
    for (var i = 0; i < rows; i++) {
      row = rowPattern.map((type, col) => {
        return { type, student: null, row: i, col }
      })
      grids.push(JSON.parse(JSON.stringify(row)))
    }
    return grids
  }
}

/**
 * [
 *  {
 *    type: GRIDS_DESK|GRIDS_FLOOR,
 *    name: '1组'|'过道'
 *  },
 *  {
 *    type: GRIDS_DESK|GRIDS_FLOOR,
 *    name: '1组'|'过道'
 *  },
 *  ...
 * ]
 * @param state
 * @param getters
 * @param rootState
 * @returns {function(*=, *): Array}
 */
export function generateDeskGridsHead (state, getters, rootState) {
  return (rowPattern, groupDirection) => {
    rowPattern = rowPattern || [
      rootState.consts.GRIDS_DESK,
      rootState.consts.GRIDS_DESK,
      rootState.consts.GRIDS_FLOOR,
      rootState.consts.GRIDS_DESK,
      rootState.consts.GRIDS_DESK,
      rootState.consts.GRIDS_DESK,
      rootState.consts.GRIDS_DESK,
      rootState.consts.GRIDS_FLOOR,
      rootState.consts.GRIDS_DESK,
      rootState.consts.GRIDS_DESK
    ]
    let gridsHead = [], i, length
    let groupName = groupDirection === rootState.consts.GROUP_DIRECTION_LR ? 1 : rowPattern.filter(item => item === rootState.consts.GRIDS_DESK).length
    for (i = 0, length = rowPattern.length; i < length; i++) {
      gridsHead.push({
        type: rowPattern[i],
        name: rowPattern[i] === rootState.consts.GRIDS_DESK ? (groupName + '组') : '过道'
      })
      if (rowPattern[i] === rootState.consts.GRIDS_DESK) {
        if (groupDirection === rootState.consts.GROUP_DIRECTION_LR) {
          groupName++
        } else {
          groupName--
        }
      }
    }
    return gridsHead
  }
}

export function emptyDeskCount (state, getters, rootState) {
  return () => {
    return state.currentClassroom.grids.reduce((preRowCount, row) => {
      return preRowCount + row.reduce((preColumnCount, item) => {
        if (item.type === rootState.consts.GRIDS_DESK) {
          if (!item.student) {
            return preColumnCount + 1
          }
        }
        return preColumnCount
      }, 0)
    }, 0)
  }
}

/**
 *
 * @param state
 * @returns {Function}  [rowIndex, colIndex]
 */
export function nextEmptyDesk (state) {
  return () => {
    // TODO nextEmptyDesk
    let groupDirection = state.currentClassroom.groupDirection
    for (let rowIndex = state.currentClassroom.grids.length - 1; rowIndex >= 0; rowIndex--) {
      let row = state.currentClassroom.grids[rowIndex]
      let colIndex, len, desk
      if (groupDirection === consts.GROUP_DIRECTION_LR) {
        for (colIndex = 0, len = row.length; colIndex < len; colIndex++) {
          desk = row[colIndex]
          if (desk.type === consts.GRIDS_DESK && !desk.student) {
            return [rowIndex, colIndex]
          }
        }
      } else {
        for (colIndex = row.length - 1; colIndex >= 0; colIndex--) {
          desk = row[colIndex]
          if (desk.type === consts.GRIDS_DESK && !desk.student) {
            return [rowIndex, colIndex]
          }
        }
      }
    }
    return [0, 0]
  }
}

export function nextStudentNumber (state) {
  return () => {
    const latestSNO = state.currentClassroom.students.reduce((previousValue, student) => {
      if (student.sno && student.sno > previousValue) {
        return student.sno
      }
      return previousValue
    }, null)
    if (isNaN(parseInt(latestSNO))) {
      return null
    }
    return latestSNO + 1
  }
}

export function nextStudentId (state) {
  return () => {
    const nextId = `new-${state.nextNewStudentId}`
    state.nextNewStudentId = state.nextNewStudentId + 1
    return nextId
  }
}

export function getReadableSeat (state, getters) {
  return ({ rowIndex, colIndex }) => {
    let groupName = getters.getReadableSeatGroup(colIndex)
    let rowName = getters.getReadableSeatRow(rowIndex)
    return `${groupName}，${rowName}`
  }
}

export function getReadableSeatGroup (state) {
  return (colIndex) => {
    let groupName = state.currentClassroom.gridsHead[colIndex].name
    return `第${groupName}`
  }
}

export function getReadableSeatRow (state) {
  return (rowIndex) => {
    let rowName = state.currentClassroom.grids.length - rowIndex
    return `第${rowName}排`
  }
}
