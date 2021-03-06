<template>
  <v-row>
    <v-col cols="">
      <v-card min-height="875" outlined tile>
        <v-card-text>
          <data-table
            class="ma-5"
            :data="getTaskList"
            :header="header"
            :useSearch="false"
          >
            <template v-slot:[`item.categoryId`]="{ item }">
              <v-chip
                v-bind:color="getCategoryProperty(item.categoryId, 'color')"
                class="mr-5 chip_width"
              >
                <span class="chip_text">
                  {{ getCategoryProperty(item.categoryId, 'categoryName') }}
                </span>
              </v-chip>
            </template>
            <template v-slot:[`item.statusId`]="{ item }">
              <v-chip
                v-bind:color="getStatusProperty(item.statusId, 'color')"
                class="mr-5 chip_width"
              >
                <span class="chip_text">
                  {{ getStatusProperty(item.statusId, 'statusName') }}
                </span>
              </v-chip>
            </template>
          </data-table>
        </v-card-text>
      </v-card>
    </v-col>
    <v-overlay :absolute="absolute" :value="isLoading">
      <v-progress-circular
        :size="70"
        :width="7"
        color="green"
        indeterminate
      ></v-progress-circular>
    </v-overlay>
  </v-row>
</template>

<script lang="ts">
  import { Component, Vue } from 'vue-property-decorator';
  import { DataTableHeader } from 'vuetify';
  import { CategoryData, TaskData, StatusData } from '../types/types';
  import DataTable from '../components/organisms/DataTable.vue';
  import { taskStore } from '@/store/modules/task';
  import { categoryStore } from '@/store/modules/category';
  import { statusStore } from '@/store/modules/status';
  import axios, { AxiosError, AxiosResponse } from 'axios';

  @Component({
    components: {
      DataTable,
    },
  })
  export default class Kanban extends Vue {
    isLoading: boolean = false;
    taskData: TaskData[] = [];
    categoryData: CategoryData[] = [];
    statusData: StatusData[] = [];
    header: DataTableHeader[] = [
      {
        text: 'カテゴリー',
        align: 'center',
        value: 'categoryId',
        width: '100',
      },
      { text: '件名', align: 'start', value: 'subject', width: '500' },
      { text: '状態', align: 'center', value: 'statusId', width: '100' },
      { text: '期限', align: 'center', value: 'deadLine', width: '150' },
    ];

    async created() {
      this.isLoading = true;
      await axios
        .post('/kanban/get-data')
        .then((res: AxiosResponse) => {
          categoryStore.setCategoryData(res.data.categoryData);
          taskStore.setTaskList(res.data.taskData);
          statusStore.setStatusData(res.data.statusData);
        })
        .catch((err: AxiosError) => {});
      this.taskData = taskStore.GET_TASK_LIST;
      this.categoryData = categoryStore.GET_CATEGORY_DATA;
      this.statusData = statusStore.GET_STATUS_DATA;
    }

    updated() {
      this.isLoading = false;
    }

    getCategoryProperty(
      id: number,
      targetProperty: keyof CategoryData
    ): string | number | undefined {
      let property: CategoryData | undefined = this.categoryData.find(
        v => v.categoryId == id
      );
      if (property === undefined) {
        property = {
          categoryId: 0,
          categoryName: 'Not Data',
          color: '#FFFFFF',
        };
      }
      return property[targetProperty];
    }

    getStatusProperty(
      id: number,
      targetProperty: keyof StatusData
    ): string | number | undefined {
      let property: StatusData | undefined = this.statusData.find(
        v => v.statusId == id
      );
      if (property === undefined) {
        property = { statusId: 0, statusName: 'Not Data', color: '#FFFFFF' };
      }
      return property[targetProperty];
    }

    filterByCategory(categoryId: number) {
      if (categoryId === 0) {
        this.taskData = taskStore.GET_TASK_LIST;
      } else {
        this.taskData = taskStore.GET_TASK_LIST.filter(
          v => v.categoryId == categoryId
        );
      }
    }

    get getTaskList() {
      this.taskData = taskStore.GET_TASK_LIST;
      return this.taskData;
    }
  }
</script>

<style>
  .chip_width {
    width: 75px;
    justify-content: center;
  }
  .chip_text {
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
  }
  .v-data-footer__select {
    display: none;
  }
</style>
