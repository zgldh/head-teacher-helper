import Vue from 'vue'

export function loadClassrooms () {
  const db = Vue.prototype.$dexie
  return db.classrooms.toArray()
}

export function createClass (classObject) {
  const db = Vue.prototype.$dexie
  return db.classrooms.add(classObject)
}

export function deleteClass (classId) {
  const db = Vue.prototype.$dexie
  return db.transaction('rw', db.classrooms, db.tests, db.students, tx => {
    return Promise.all([
      db.classrooms.delete(classId),
      db.tests.where({ classroomId: classId }).delete(),
      db.students.where({ classroomId: classId }).delete()
    ])
  }).catch(error => {
    //
    // Transaction Failed
    //
    console.error(error.stack)
  })
}

export function updateClassroom (classroomId, keyValues) {
  const db = Vue.prototype.$dexie
  return db.classrooms.update(classroomId, keyValues)
}

export function loadStudents (classroomId) {
  const db = Vue.prototype.$dexie
  return db.students.where({ classroomId: classroomId }).sortBy('sno')
}

export function addStudents (classroomId, students) {
  const db = Vue.prototype.$dexie
  return db.students.bulkAdd(students.map(student => {
    delete student.id
    return Object.assign({}, student, { classroomId: classroomId })
  }))
}

export function updateStudent (studentId, keyValues) {
  const db = Vue.prototype.$dexie
  return db.students.update(studentId, keyValues)
}

export function deleteStudent (studentId) {
  const db = Vue.prototype.$dexie
  return db.transaction('rw', db.students, db.scores, tx => {
    return Promise.all([
      db.students.delete(studentId),
      db.scores.where({ studentId: studentId }).delete()
    ])
  }).catch(error => {
    //
    // Transaction Failed
    //
    console.error(error.stack)
  })
}

export function loadTests (classroomId) {
  const db = Vue.prototype.$dexie
  return db.tests.where({ classroomId: classroomId }).sortBy('course')
}

export function addTests (classroomId, tests) {
  const db = Vue.prototype.$dexie
  return db.tests.bulkAdd(tests.map(test => {
    delete test.id
    return Object.assign({}, test, { classroomId: classroomId })
  }))
}

export function updateTest (testId, keyValues) {
  const db = Vue.prototype.$dexie
  return db.tests.update(testId, keyValues)
}

export function deleteTest (testId) {
  const db = Vue.prototype.$dexie
  return db.transaction('rw', db.tests, db.scores, tx => {
    return Promise.all([
      db.tests.delete(testId),
      db.scores.where({ testId: testId }).delete()
    ])
  }).catch(error => {
    //
    // Transaction Failed
    //
    console.error(error.stack)
  })
}

export function loadScoresByTests (testIds) {
  const db = Vue.prototype.$dexie
  return db.scores.where('testId').anyOf(testIds).toArray()
}

export function addScore (studentId, testId, score) {
  const db = Vue.prototype.$dexie
  let scoreItem = {
    studentId, testId, score
  }
  return db.scores.add(scoreItem).then(result => {
    return Object.assign({}, scoreItem, { id: result })
  })
}

export function updateScoreByStudentAndTest (studentId, testId, score) {
  const db = Vue.prototype.$dexie
  return db.scores.where({ studentId: studentId, testId: testId }).first().then(foundScore => {
    return foundScore ? updateScoreById(foundScore.id, score) : addScore(studentId, testId, score)
  }).catch(err => {
    console.log('addScore', err)
    return addScore(studentId, testId, score)
  })
}

export function updateScoreById (scoreId, score) {
  const db = Vue.prototype.$dexie
  return db.scores.update(scoreId, {
    score: score
  })
}

export function deleteScore (scoreId) {
  const db = Vue.prototype.$dexie
  return db.transaction('rw', db.scores, tx => {
    return Promise.all([
      db.scores.delete(scoreId)
    ])
  }).catch(error => {
    //
    // Transaction Failed
    //
    console.error(error.stack)
  })
}
