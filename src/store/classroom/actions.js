import { loadClassrooms, createClass, deleteClass, updateClassroom,
  loadStudents, addStudents as apiAddStudents, updateStudent,
  loadTests as apiLoadTests, addTests, updateTest, deleteTest,
  loadActivities as apiLoadActivities, addActivities, updateActivity, deleteActivity
} from '../../apis/offline'
import { ERROR_STUDENTS_IN_PLACE } from './state'
/*
export function someAction (context) {
}
*/

export function getClassrooms (context) {
  return loadClassrooms().then(result => {
    context.commit('setClassrooms', result)
    return result
  })
}

export function createClassroom (context) {
  let newClassroom = context.getters.generateNewClassroom()
  context.commit('addClassroom', newClassroom)
  let classroomDatabaseRecord = {
    id: newClassroom.id,
    title: newClassroom.title,
    studentCount: newClassroom.studentCount,
    grids: normalizeGrids(newClassroom.grids),
    gridsHead: newClassroom.gridsHead,
    groupDirection: newClassroom.groupDirection, // GROUP_DIRECTION_LR: 'lr',| GROUP_DIRECTION_RL: 'rl',
    seatsRules: newClassroom.seatsRules,
    positions: newClassroom.positions
  }
  return createClass(classroomDatabaseRecord)
}

export function deleteClassroom (context, classroomId) {
  return deleteClass(classroomId).then(result => {
    context.commit('removeClassroomById', classroomId)
    return true
  })
}

export function changeClassroomTitle (context, { classroomId, title }) {
  return updateClassroom(classroomId, { title: title }).then(result => {
    context.commit('changeClassroomTitle', { classroomId, title })
    return true
  })
}

export function reloadClassroom (context) {
  return context.dispatch('loadClassroom', context.state.currentClassroom.id)
}

export function loadClassroom (context, classroomId) {
  return new Promise(async (resolve, reject) => {
    if (!context.state.classrooms.length) {
      await context.dispatch('getClassrooms')
    }
    let classroom = context.state.classrooms.find(classroom => classroom.id === classroomId)
    if (!classroom) {
      return reject(`Can not find classroom ${classroomId}.`)
    }
    if (classroom.studentCount !== classroom.students.length) {
      classroom.students = await loadStudents(classroom.id)
    }

    await context.dispatch('loadTests', classroom.id)
    await context.dispatch('loadActivities', classroom.id)

    context.commit('setCurrentClassroom', classroom)
    classroom.students.forEach(student => {
      context.commit('bindStudentToTile', {
        student: student,
        rowIndex: student.seat[0],
        colIndex: student.seat[1]
      })
    })
    return resolve(classroom)
  })
}

export function saveDeskArrangement (context) {
  let requests = [
    context.dispatch('saveCurrentClassroomGrids')
  ]

  context.state.currentClassroom.grids.forEach((row, rowIndex) => {
    row.forEach((tile, colIndex) => {
      let student = tile.student
      if (student && (student.seat[0] !== rowIndex || student.seat[1] !== colIndex)) {
        requests.push(updateStudent(student.id, { seat: [rowIndex, colIndex] }))
      }
    })
  })
  /**
   *  TODO
   *  1. Save context.state.currentClassroom to backend
   **/
  /**
     *  2. Copy context.state.currentClassroom to context.state.originalClassroom
     */
  return Promise.all(requests).then(result => {
    context.commit('copyCurrentClassroomAsOrigin')
    context.commit('changeEditorStatus', context.state.EDITOR_STATUS_DISABLED)
  })
}

export function changeClassroomGroupDirection (context, direction) {
  if (context.state.currentClassroom.groupDirection !== direction) {
    // Update currentClassroom.gridsHead
    let headPattern = context.state.currentClassroom.gridsHead.map(head => head.type)
    let heads = context.getters.generateDeskGridsHead(headPattern, direction)
    context.commit('updateClassroomGridsHead', heads)
    context.commit('changeClassroomGroupDirection', direction)
  }
}

function saveNewStudents (currentClassroom) {
  return apiAddStudents(currentClassroom.id, currentClassroom.students.filter(student => {
    return (student.id + '').indexOf('new-') === 0
  })).then(result => {
    return updateClassroom(currentClassroom.id, { studentCount: currentClassroom.studentCount })
  })
}

export function addStudents (context, { students, initialStudentNumber }) {
  context.commit('addStudents', { students, initialStudentNumber })
  return saveNewStudents(context.state.currentClassroom)
}

export function addStudent (context, { student, rowIndex, colIndex }) {
  context.commit('addStudent', { student, rowIndex, colIndex })
  return saveNewStudents(context.state.currentClassroom)
}

export function saveCurrentClassroomGrids (context) {
  return updateClassroom(context.state.currentClassroom.id, {
    grids: normalizeGrids(context.state.currentClassroom.grids),
    gridsHead: context.state.currentClassroom.gridsHead
  })
}

export function moveStudent (context, { student, sourceRow, sourceCol, targetRow, targetCol }) {
  context.commit('moveStudent', { student, sourceRow, sourceCol, targetRow, targetCol })
  let sourceGrid = context.state.currentClassroom.grids[sourceRow][sourceCol]
  let targetGrid = context.state.currentClassroom.grids[targetRow][targetCol]
  let sourceStudent = sourceGrid.student
  let targetStudent = targetGrid.student
  let requests = []
  if (sourceStudent) {
    requests.push(updateStudent(sourceStudent.id, { seat: sourceStudent.seat }))
  }
  if (targetStudent) {
    requests.push(updateStudent(targetStudent.id, { seat: targetStudent.seat }))
  }
  return Promise.all(requests)
}

export function removeColumn (context, columnIndex) {
  let hasStudents = false
  context.state.currentClassroom.grids.forEach(row => {
    if (row[columnIndex].hasOwnProperty('student') && row[columnIndex].student) {
      hasStudents = true
    }
  })
  if (hasStudents) {
    return Promise.reject(ERROR_STUDENTS_IN_PLACE)
  }
  context.commit('removeColumn', columnIndex)
}
export function removeRow (context, rowIndex) {
  let hasStudents = false
  context.state.currentClassroom.grids[rowIndex].forEach(tile => {
    if (tile.hasOwnProperty('student') && tile.student) {
      hasStudents = true
    }
  })
  if (hasStudents) {
    return Promise.reject(ERROR_STUDENTS_IN_PLACE)
  }
  context.commit('removeRow', rowIndex)
}

/**
 * 将currentClassroom的学生位置进行储存
 * @param {*} context
 */
export function saveCurrentClassroomStudentsSeats (context) {
  let requests = []
  context.state.currentClassroom.students.forEach(student => {
    requests.push(updateStudent(student.id, { seat: student.seat }))
  })
  return Promise.all(requests)
}

export function seatsShuffle (context) {
  context.commit('copyCurrentClassroomAsOrigin')
  context.commit('seatsShuffle')
  return context.dispatch('saveCurrentClassroomStudentsSeats')
}

export function seatsPanLeft (context) {
  context.commit('copyCurrentClassroomAsOrigin')
  context.commit('seatsPanLeft')
  return context.dispatch('saveCurrentClassroomStudentsSeats')
}

export function seatsPanRight (context) {
  context.commit('copyCurrentClassroomAsOrigin')
  context.commit('seatsPanRight')
  return context.dispatch('saveCurrentClassroomStudentsSeats')
}

export function seatsPanFront (context) {
  context.commit('copyCurrentClassroomAsOrigin')
  context.commit('seatsPanFront')
  return context.dispatch('saveCurrentClassroomStudentsSeats')
}

export function seatsPanBackward (context) {
  context.commit('copyCurrentClassroomAsOrigin')
  context.commit('seatsPanBackward')
  return context.dispatch('saveCurrentClassroomStudentsSeats')
}

export function selectStudent (context, student) {
  if (context.state.selectedStudent !== student) {
    context.commit('setSelectedStudent', student)
    context.commit('setLayoutRightDrawerOpen', true)
  } else {
    context.commit('cleanSelectedStudent')
    context.commit('setLayoutRightDrawerOpen', false)
  }
}

export function cleanSelectedStudent (context) {
  context.commit('cleanSelectedStudent')
  context.commit('setLayoutRightDrawerOpen', false)
}

export function setSelectedStudentProperty (context, { property, value }) {
  let payload = {}
  payload[property] = value
  return updateStudent(context.state.selectedStudent.id, payload).then(result => {
    context.commit('setSelectedStudentProperty', { property, value })
    return result
  })
}

export function setViewMode (context, viewMode) {
  context.commit('setViewMode', viewMode)
}

const PAN_LEFT = 'left'
const PAN_RIGHT = 'right'

function panItem (items, targetIndex, sortKey, direction = PAN_LEFT) {
  items.sort((a, b) => {
    if (direction === PAN_LEFT) {
      return a[sortKey] - b[sortKey]
    } else {
      return b[sortKey] - a[sortKey]
    }
  })
  let itemIndex = items.findIndex(item => item.id === targetIndex)
  if (itemIndex === 0) {
    return Promise.resolve(true)
  }
  let item = items[itemIndex]
  let siblingTest = items[itemIndex - 1]
  let dummyIndex = item[sortKey]
  item[sortKey] = siblingTest[sortKey]
  siblingTest[sortKey] = dummyIndex
  return {
    target: item,
    sibling: siblingTest
  }
}

// Test start

export function loadTests (context, classroomId) {
  return apiLoadTests(classroomId).then(result => {
    context.commit('setTests', result)
    return result
  })
}

export function addCourseTest (context, { course, name, date, index = null }) {
  if (!index) {
    index = context.state.tests[course].map(item => item.index).sort().pop() + 1
  }
  let test = { course,
    name,
    date,
    index
  }

  return addTests(context.state.currentClassroom.id, [test]).then(lastTestId => {
    test = Object.assign({}, test, { id: lastTestId })
    context.commit('addTest', test)
    return test
  })
}

export function moveCourseTestLeft (context, { id, course }) {
  let { target, sibling } = panItem(context.state.tests[course], id, 'index', PAN_LEFT)
  return Promise.all([
    context.dispatch('updateCourseTest', Object.assign({}, target, { course: course })),
    context.dispatch('updateCourseTest', Object.assign({}, sibling, { course: course }))
  ])
}

export function moveCourseTestRight (context, { id, course }) {
  let { target, sibling } = panItem(context.state.tests[course], id, 'index', PAN_RIGHT)
  return Promise.all([
    context.dispatch('updateCourseTest', Object.assign({}, target, { course: course })),
    context.dispatch('updateCourseTest', Object.assign({}, sibling, { course: course }))
  ])
}

export function updateCourseTest (context, { id, course, name, date, index }) {
  let test = {
    name: name,
    date: date,
    index: index
  }
  return updateTest(id, test).then(result => {
    test = Object.assign({}, test, { id: id, course: course })
    context.commit('updateTest', test)
    return Object.assign({}, test, { id: id })
  })
}
export function deleteCourseTest (context, { id, course }) {
  return deleteTest(id).then(result => {
    context.commit('removeTest', { course, id })
  })
}

// Test end

// Activity start

export function loadActivities (context, classroomId) {
  return apiLoadActivities(classroomId).then(result => {
    context.commit('setActivities', result)
    return result
  })
}

export function addActivity (context, { name, date, index = null }) {
  if (!index) {
    index = context.state.activities.map(item => item.index).sort().pop() + 1
  }
  let activity = {
    name,
    date,
    index
  }

  return addActivities(context.state.currentClassroom.id, [activity]).then(lastActivityId => {
    activity = Object.assign({}, activity, { id: lastActivityId })
    context.commit('addActivity', activity)
    return activity
  })
}

export function moveActivityLeft (context, id) {
  let { target, sibling } = panItem(context.state.activities, id, 'index', PAN_LEFT)
  return Promise.all([
    context.dispatch('updateCourseActivity', Object.assign({}, target)),
    context.dispatch('updateCourseActivity', Object.assign({}, sibling))
  ])
}

export function moveActivityRight (context, id) {
  let { target, sibling } = panItem(context.state.activities, id, 'index', PAN_RIGHT)
  return Promise.all([
    context.dispatch('updateCourseActivity', Object.assign({}, target)),
    context.dispatch('updateCourseActivity', Object.assign({}, sibling))
  ])
}

export function updateCourseActivity (context, { id, name, date, index }) {
  let activity = {
    name: name,
    date: date,
    index: index
  }
  return updateActivity(id, activity).then(result => {
    activity = Object.assign({}, activity, { id: id })
    context.commit('updateActivity', activity)
    return Object.assign({}, activity, { id: id })
  })
}

export function deleteCourseActivity (context, id) {
  return deleteActivity(id).then(result => {
    context.commit('removeActivity', id)
  })
}

// Activity end

function normalizeGrids (grids) {
  return grids.map(row => {
    return row.map(tile => {
      return { // Column/Tile
        type: tile.type,
        row: tile.row,
        col: tile.col
      }
    })
  })
}
