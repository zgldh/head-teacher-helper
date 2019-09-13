<template>
  <q-page class="flex flex-center">
    <div class="classrooms-grid">
      <!--
        In this example every card has a "style" tag with a width.
        Consider defining a CSS class instead to ease the template syntax.
      -->
      <q-card>
        <q-btn
          class="create-classroom-button"
          primary
          color="primary"
          @click="createClassroom"
          aria-label="创建班级"
        >
          <q-icon name="add"/>
          创建班级
        </q-btn>
      </q-card>
      <q-card v-for="classroom in classrooms" :key="classroom.id">
        <q-card-title>
          <q-btn class="title-button" flat dense color="primary" size="lg" :label="classroom.title"
                 @click="$router.push({ name: 'classroom-grid-page', params: { classroomId: classroom.id } })"/>
          <div slot="right" class="row items-center">
            <span title="学生数量"><q-icon name="people"/> {{classroom.studentCount }}</span>
            <q-icon name="more_vert">
              <q-popover>
                <q-list link class="no-border">
                  <q-item v-close-overlay @click.native="deleteClassroom(classroom)">
                    <q-item-main label="删除班级"/>
                  </q-item>
                </q-list>
              </q-popover>
            </q-icon>
          </div>
        </q-card-title>
        <q-card-separator/>
        <q-card-main>
          没有待办事项
        </q-card-main>
      </q-card>
    </div>
  </q-page>
</template>

<style>
  .classrooms-grid {
    margin-top: 5em;
    display: flex;
    width: calc(900px + 3em);
    flex-direction: row;
    place-items: initial;
    flex-wrap: wrap;
    justify-content: space-between;
    place-content: center;
  }

  .classrooms-grid .q-card {
    width: 300px;
    height: 200px;
    margin-bottom: 1em;
    margin-right: 1em;
  }

  .classrooms-grid .q-card .create-classroom-button {
    display: block;
    width: 100%;
    height: 100%;
  }

  .classrooms-grid .q-card .q-card-primary.q-card-container {
    padding: 8px;
  }

  .classrooms-grid .q-card .q-card-title .title-button {
    padding: 0 0.285em;
  }
</style>

<script>
export default {
  name: 'PageIndex',
  computed: {
    classrooms () {
      return this.$store.state.classroom.classrooms
    }
  },
  mounted () {
    this.$store.dispatch('classroom/getClassrooms')
    this.$store.dispatch('classroom/setViewMode', 'grid')
  },
  methods: {
    async createClassroom () {
      this.$store.dispatch('classroom/createClassroom').then(newClassroomId => {
        this.$router.push({ name: 'classroom-grid-page', params: { classroomId: newClassroomId } })
      })
    },
    async deleteClassroom (classroom) {
      this.$q.dialog({
        title: `确定要删除班级 “${classroom.title}” 吗？`,
        message: '班级内所有学生和得分都会被删除。',
        ok: {
          color: 'red',
          label: '删除'
        },
        cancel: '算了'
      }).then(async () => {
        await this.$store.dispatch('classroom/deleteClassroom', classroom.id)
      }).catch(() => {
      })
    }
  }
}
</script>
