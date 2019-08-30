/*
export function someMutation (state) {
}
*/
import Vue from 'vue'
import consts from '../consts/state'
import _ from 'lodash'

export function setClassrooms (state, classrooms) {
  state.classrooms.splice(0, state.classrooms.length, ...classrooms.map(classroom => {
    if (!classroom.hasOwnProperty('students')) {
      classroom.students = []
    }
    return classroom
  }))
}

export function addClassroom (state, classroom) {
  state.classrooms.push(classroom)
}

export function removeClassroomById (state, classroomId) {
  state.classrooms.splice(state.classrooms.findIndex(item => item.id === classroomId), 1)
}

export function setCurrentClassroom (state, classroom) {
  state.currentClassroom = { ...classroom }
}

export function changeEditorStatus (state, status) {
  if (status === state.EDITOR_STATUS_DESK) {
    copyCurrentClassroomAsOrigin(state)
  } else if (status === state.EDITOR_STATUS_SEAT) {
    copyCurrentClassroomAsOrigin(state)
  } else if (status === state.EDITOR_STATUS_DISABLED) {
    restoreOriginalClassroom(state)
  }
  state.editorStatus = status
}

export function copyCurrentClassroomAsOrigin (state) {
  state.originalClassroom = JSON.stringify(state.currentClassroom)
}

export function restoreOriginalClassroom (state) {
  state.currentClassroom = JSON.parse(state.originalClassroom)
}

export function changeClassroomTitle (state, { classroomId, title }) {
  let classroomIndex = state.classrooms.findIndex(item => item.id === classroomId)
  if (classroomIndex >= 0) {
    state.classrooms[classroomIndex].title = title
    if (state.currentClassroom.id === classroomId) {
      state.currentClassroom.title = title
    }
  }
}

export function changeClassroomGroupDirection (state, direction) {
  state.currentClassroom.groupDirection = direction
}

export function updateClassroomGridsHead (state, head) {
  state.currentClassroom.gridsHead = head
}

export function insertColumn (state, { index, type }) {
  state.currentClassroom.grids.forEach(row => {
    row.splice(index, 0, { type, student: null })
  })
  state.currentClassroom.gridsHead.splice(index, 0, { type: type, name: '过道' })

  let headPattern = state.currentClassroom.gridsHead.map(head => head.type)
  let heads = this.getters['classroom/generateDeskGridsHead'](headPattern, state.currentClassroom.groupDirection)
  updateClassroomGridsHead(state, heads)
  refreshGridsRowColumnProperty(state)
}

export function insertRow (state, index) {
  // let row = state.currentClassroom.gridsHead.map(head => consts.GRIDS_FLOOR)
  let row = state.currentClassroom.gridsHead.map(head => head.type)
  state.currentClassroom.grids.splice(index, 0, JSON.parse(JSON.stringify(row.map(type => {
    return {
      type: type,
      student: null
    }
  }))))
  refreshGridsRowColumnProperty(state)
}

export function removeColumn (state, index) {
  state.currentClassroom.grids.forEach(row => {
    if (row[index].hasOwnProperty('student') && row[index].student) {
      row[index].student.seat = null
    }
    row.splice(index, 1)
  })
  state.currentClassroom.gridsHead.splice(index, 1)
  refreshGridsRowColumnProperty(state)
}

export function removeRow (state, index) {
  state.currentClassroom.grids[index].forEach(tile => {
    if (tile.hasOwnProperty('student') && tile.student) {
      tile.student.seat = null
    }
  })
  state.currentClassroom.grids.splice(index, 1)
  refreshGridsRowColumnProperty(state)
}

export function refreshGridsRowColumnProperty (state) {
  state.currentClassroom.grids.forEach((rowData, rowIndex) => {
    rowData.forEach((colData, colIndex) => {
      colData.row = rowIndex
      colData.col = colIndex
    })
  })
}

/**
 * Toggle a tile between desk and floor
 * @param state
 * @param rowIndex
 * @param colIndex
 */
export function toggleClassroomTile (state, { rowIndex, colIndex }) {
  if (state.currentClassroom.grids.hasOwnProperty(rowIndex)) {
    let row = state.currentClassroom.grids[rowIndex]
    if (row.hasOwnProperty(colIndex)) {
      if (row[colIndex].type === consts.GRIDS_FLOOR) {
        state.currentClassroom.grids[rowIndex][colIndex].type = consts.GRIDS_DESK
      } else if (row[colIndex].type === consts.GRIDS_DESK) {
        state.currentClassroom.grids[rowIndex][colIndex].type = consts.GRIDS_FLOOR
      }
    }
  }
}

export function bindStudentToTile (state, { student, rowIndex, colIndex }) {
  if (state.currentClassroom.grids.hasOwnProperty(rowIndex)) {
    let row = state.currentClassroom.grids[rowIndex]
    if (row.hasOwnProperty(colIndex)) {
      if (row[colIndex].type === consts.GRIDS_DESK) {
        Vue.set(state.currentClassroom.grids[rowIndex][colIndex], 'student', student)
        if (student.seat) {
          if (student.seat[0] !== rowIndex || student.seat[1] !== colIndex) {
            student.seat = [rowIndex, colIndex]
          }
        }
      }
    }
  }
}

export function addStudent (state, { student, sno, rowIndex, colIndex }) {
  let studentObject = {
    id: this.getters['classroom/nextStudentId'](),
    sno: sno || '无学号',
    name: student,
    seat: [rowIndex, colIndex],
    tags: [], // 标签
    birthday: null, // 生日
    gender: null, // 性别
    positions: [] // 班干部职位
  }
  state.currentClassroom.students.push(studentObject)
  state.currentClassroom.studentCount++
  bindStudentToTile(state, {
    student: studentObject,
    rowIndex: rowIndex,
    colIndex: colIndex
  })
}

export function addStudents (state, { students, initialStudentNumber }) {
  let rowIndex, colIndex
  students.forEach(student => {
    [rowIndex, colIndex] = this.getters['classroom/nextEmptyDesk']()
    addStudent.bind(this)(state, { student, rowIndex, colIndex, sno: initialStudentNumber ? initialStudentNumber++ : null })
  })
  state.currentClassroom.studentCount = state.currentClassroom.students.length
}

/**
 * @param state
 * @param student
 * @param sourceRow
 * @param sourceCol
 * @param targetRow
 * @param targetCol
 */
export function moveStudent (state, { student, sourceRow, sourceCol, targetRow, targetCol }) {
  if (sourceRow === undefined || sourceCol === undefined) {
    sourceRow = student.seat[0]
    sourceCol = student.seat[1]
  }
  let sourceGrid = state.currentClassroom.grids[sourceRow][sourceCol]
  let targetGrid = state.currentClassroom.grids[targetRow][targetCol]
  let sourceStudent = sourceGrid.student
  let targetStudent = targetGrid.student
  if (sourceStudent) {
    updateStudentSeat(state, { student: sourceStudent, targetRow, targetCol })
  }
  if (targetStudent) {
    updateStudentSeat(state, { student: targetStudent, targetRow: sourceRow, targetCol: sourceCol })
  }
  Vue.set(sourceGrid, 'student', targetStudent)
  Vue.set(targetGrid, 'student', sourceStudent)
  return { sourceStudent, targetStudent }
}

export function updateStudentSeat (state, { student, targetRow, targetCol }) {
  for (var index = 0, length = state.currentClassroom.students.length; index < length; index++) {
    let currentStudent = state.currentClassroom.students[index]
    if (currentStudent.name === student.name && currentStudent.seat[0] === student.seat[0] && currentStudent.seat[1] === student.seat[1]) {
      state.currentClassroom.students[index].seat = [targetRow, targetCol]
      student.seat = [targetRow, targetCol]
      break
    }
  }
}

/**
 * @param state
 */
export function seatsShuffle (state) {
  if (state.currentClassroom.students.length === 0) {
    return false
  }
  let studentsIndex = state.currentClassroom.students.map((item, index) => index)

  for (let rowIndex = state.currentClassroom.grids.length - 1; rowIndex >= 0; rowIndex--) {
    let row = state.currentClassroom.grids[rowIndex]
    for (let colIndex = 0, colLength = row.length; colIndex < colLength; colIndex++) {
      let col = row[colIndex]
      if (col.type === consts.GRIDS_DESK) {
        if (studentsIndex.length) {
          // Set a student
          let preIndex
          let student
          let rollTimes = 3
          do {
            preIndex = Math.ceil(Math.random() * studentsIndex.length) - 1
            student = state.currentClassroom.students[studentsIndex[preIndex]]
            if (rowIndex !== student.seat[0] || colIndex !== student.seat[1]) {
              studentsIndex.splice(preIndex, 1)
              break
            }
          } while (--rollTimes)
          moveStudent(state, { student, targetRow: rowIndex, targetCol: colIndex })
        } else {
          // Set as empty
          Vue.set(state.currentClassroom.grids[rowIndex][colIndex], 'student', null)
        }
      }
    }
  }
}

export function seatsPanLeft (state) {
  for (let rowIndex = state.currentClassroom.grids.length - 1; rowIndex >= 0; rowIndex--) {
    let row = state.currentClassroom.grids[rowIndex]
    for (let colIndex = 0, colLength = row.length; colIndex < colLength; colIndex++) {
      let col = row[colIndex]
      if (col.type === consts.GRIDS_DESK) {
        let sourceDesk = row.find((item, index) => {
          return index > colIndex && item.type === consts.GRIDS_DESK
        })
        if (sourceDesk) {
          if (sourceDesk.student) {
            // Pull student from source desk
            moveStudent(state, { student: sourceDesk.student, targetRow: rowIndex, targetCol: colIndex })
          } else if (col.student) {
            // Push student to source desk
            moveStudent(state, { student: col.student, targetRow: sourceDesk.row, targetCol: sourceDesk.col })
          } else {
            // Do nothing
          }
        }
      }
    }
  }
}

export function seatsPanRight (state) {
  for (let rowIndex = state.currentClassroom.grids.length - 1; rowIndex >= 0; rowIndex--) {
    let row = state.currentClassroom.grids[rowIndex]
    for (let colIndex = row.length - 1; colIndex >= 0; colIndex--) {
      let col = row[colIndex]
      if (col.type === consts.GRIDS_DESK) {
        let sourceDesk = row.filter(tile => {
          return tile.col < colIndex && tile.type === consts.GRIDS_DESK
        }).sort((a, b) => {
          return a.col - b.col
        }).pop()
        if (sourceDesk) {
          if (sourceDesk.student) {
            // Pull student from source desk
            moveStudent(state, { student: sourceDesk.student, targetRow: rowIndex, targetCol: colIndex })
          } else if (col.student) {
            // Push student to source desk
            moveStudent(state, { student: col.student, targetRow: sourceDesk.row, targetCol: sourceDesk.col })
          } else {
            // Do nothing
          }
        }
      }
    }
  }
}

export function seatsPanFront (state) {
  const minRowIndex = state.currentClassroom.gridsHead.map(head => null)
  for (let rowIndex = 0, rowLength = state.currentClassroom.grids.length; rowIndex < rowLength; rowIndex++) {
    let row = state.currentClassroom.grids[rowIndex]
    for (let colIndex = 0, colLength = row.length; colIndex < colLength; colIndex++) {
      let col = row[colIndex]
      if (col.type === consts.GRIDS_DESK) {
        if (col.student && minRowIndex[colIndex] === null) {
          minRowIndex[colIndex] = rowIndex
          continue
        }

        if (minRowIndex[colIndex] === null) {
          continue
        }
        let sourceDesk = state.currentClassroom.grids[minRowIndex[colIndex]][colIndex]
        if (sourceDesk) {
          if (sourceDesk.student) {
            // Pull student from source desk
            moveStudent(state, { student: sourceDesk.student, targetRow: rowIndex, targetCol: colIndex })
          } else if (col.student) {
            // Push student to source desk
            moveStudent(state, { student: col.student, targetRow: sourceDesk.row, targetCol: sourceDesk.col })
          } else {
            // Do nothing
          }
        }
      }
    }
  }
}

export function seatsPanBackward (state) {
  const minRowIndex = state.currentClassroom.gridsHead.map(head => null)
  for (let rowIndex = 0, rowLength = state.currentClassroom.grids.length; rowIndex < rowLength; rowIndex++) {
    let row = state.currentClassroom.grids[rowIndex]
    for (let colIndex = 0, colLength = row.length; colIndex < colLength; colIndex++) {
      let col = row[colIndex]
      if (col.type === consts.GRIDS_DESK) {
        if (col.student && minRowIndex[colIndex] === null) {
          minRowIndex[colIndex] = rowIndex
          continue
        }
        if (minRowIndex[colIndex] === null) {
          continue
        }

        if (col.student) {
          // Pull student from source desk
          moveStudent(state, { student: col.student, targetRow: rowIndex - 1, targetCol: colIndex })
        } else {
          if (state.currentClassroom.grids[rowIndex - 1]) {
            let sourceDesk = state.currentClassroom.grids[rowIndex - 1][colIndex]
            if (sourceDesk) {
              // Push student to source desk
              moveStudent(state, { student: sourceDesk.student, targetRow: rowIndex, targetCol: colIndex })
            }
          }
        }
      }
    }
  }
}

export function setLayoutRightDrawerOpen (state, open) {
  state.layoutRightDrawerOpen = !!open
}

export function setSelectedStudent (state, student) {
  state.selectedStudent = student
}

export function cleanSelectedStudent (state) {
  state.selectedStudent = null
}

export function setSelectedStudentProperty (state, { property, value }) {
  _.set(state.selectedStudent, property, value)
}

export function setViewMode (state, viewMode) {
  state.viewMode = viewMode
}

export function setTests (state, tests) {
  for (const key in state.tests) {
    if (state.tests.hasOwnProperty(key)) {
      const element = state.tests[key]
      element.splice(0, element.length)
    }
  }
  tests.forEach(test => {
    state.tests[test.course].push(test)
  })
}

export function addTest (state, { id, course, name, date, index }) {
  let test = {
    id,
    name,
    date,
    index
  }
  state.tests[course].push(test)
}

export function updateTest (state, { id, course, name, date, index }) {
  let tests = state.tests[course]
  let arrayIndex = tests.findIndex(item => item.id === id)
  let test = tests[arrayIndex]
  _.set(test, 'name', name)
  _.set(test, 'date', date)
  _.set(test, 'index', index)
}

export function removeTest (state, { course, id }) {
  let tests = state.tests[course]
  let index = tests.findIndex(item => item.id === id)
  tests.splice(index, 1)
}
