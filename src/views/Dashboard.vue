<template>
  <div class="container">
    <div class="nav-title">
      <h1>Dashboard</h1>
    </div>

    <div v-if="loading" class="loading">
      Loading dashboard data...
    </div>

    <div v-else-if="error" class="error">
      {{ error }}
    </div>

    <div v-else class="dashboard-content">
      <div class="student-container">
        <div class="buttons">
          <Dropdown :showCurriculum="true" @update:selectedCurriculum="selectedCurriculum = $event" />
          <Dropdown :showYear="true" @update:selectedYear="selectedYear = $event" />
        </div>
        
        <div class="stats-container" v-if="filteredStats.length">
          <div v-for="(stat, index) in filteredStats" :key="index" class="stat-card">
            <div class="stat-icon">
              <font-awesome-icon icon="book-open" />
            </div>
            <div class="stat-info">
              <h3>{{ stat.count }}</h3>
              <p>{{ stat.label }}</p>
            </div>
          </div>
        </div>
      </div>

      <div class="student-list-container">
        <div className="total-students">
          <div className="container-title">
            <div className="content-title">
              <h3>Total Students</h3>
            </div>
            <div className="filter">
              <select v-model="selectedYearBarChart">
                <option value="">All</option>
                <option
                  v-for="year in years"
                  :key="year"
                  :value="year"
                >
                  {{ year.replace('-', ' - ') }}
                </option>
              </select>
            </div>
          </div>
          <div className="chart-container">
            <BarChart :chart-data="barChartData" />
          </div>
        </div>

        <div class="recent-added">
          <div class="container-title">
            <div class="title-filter-container">
              <div class="content-title">
                <h3>Recent Added</h3>
              </div>

              <div class="filter-container-recent-added">
                <select v-model="selectedSYRecentAdded" id="recentAddedFilter">
                  <option value="">All</option>
                  <option v-for="school_year in uniqueSYsRecentAdded" :key="school_year" :value="school_year">
                    {{ school_year }}
                  </option>
                </select>
              </div>
            </div>
          </div>

          <ul>
            <li v-for="(student, index) in filteredRecentAddedStudents" :key="index">
              <span>
                <span class="list-number">{{ index + 1 }}.</span>
                {{ student.name }}
              </span>
              <span class="student-course">{{ student.track }}</span>
            </li>
          </ul>
        </div>
      </div>

      <div class="document-list-container">
        <div class="recent-released">
          <div class="container-title">
            <div class="content-title">
              <h3>Recent Released</h3>
            </div>
            <div class="filter-container">
              <select v-model="selectedSY" id="syFilter">
                <option value="">All</option>
                <option v-for="school_year in uniqueSYs" :key="school_year" :value="school_year">{{ school_year }}</option>
              </select>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <!-- <th>#</th> -->
                <th>Name</th>
                <th>Track</th>
                <th>School Year</th>
                <th>Release Date & Time</th>
                
              </tr>
            </thead>
            <tbody>
              <tr v-for="(student, index) in releasedStudents" :key="student.lrn">
                <!-- <td>{{ index + 1 }}</td> -->
                <td>{{ student.name }}</td>
                <td>{{ student.track }}</td>
                <td>{{ student.school_year }}</td>
                <td>{{ formatDate(student.releaseDate) }}</td>
               
              </tr>
            </tbody>
          </table>
        </div>

       
        <div class="released-docs">
          <div class="container-title">
            <div class="content-title-docs">
              <h3>Released Docs</h3>
              <select v-model="selectedYearDocs" class="year-filter">
                <option v-for="year in years" :key="year" :value="year">{{ year }}</option>
              </select>
            </div>
          </div>
          <div class="circle-container">
            <div class="circle">
              <span class="doc-number">{{ filteredData.releasedDocs }}</span>
              <span class="doc-text">Released Documents</span>
            </div>
          </div>
          
          <div class="stats-doc"> 
            <div class="stat-box-doc">
              <!-- <p class="stat-number-doc">{{ filteredData.seniorHigh }}</p> -->
              <div class="stat-label-container-doc">
                <div class="stat-icon-doc"></div>
                <div class="stat-label-container-doc-container">
                  <p class="stat-number-doc">{{ filteredData.seniorHigh }}</p>
                  <p class="stat-label-doc">Senior High School</p>
                </div>
              </div>
            </div>
            <div class="stat-box-doc">
              <!-- <p class="stat-number-doc">{{ filteredData.juniorHigh }}</p> -->
              <div class="stat-label-container-doc">
                <div class="stat-icon-doc"></div>
                <div class="stat-label-container-doc-container">
                  <p class="stat-number-doc">{{ filteredData.juniorHigh }}</p>
                  <p class="stat-label-doc">Junior High School</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Dropdown from "@/components/Dropdown.vue";
import BarChart from "@/components/BarChart.vue";
import DashboardService from "@/service/DashboardService";
import MasterlistService from "@/service/MasterlistService";
import ReleaseService from "@/service/releaseService";

export default {
  name: "Dashboard",
  components: {
    Dropdown,
    BarChart,
  },
  data() {
    return {
      selectedCurriculum: "JHS Grade 7",
      selectedSY: "2024 - 2025",
      currentPage: 1,
      itemsPerPage: 10,
      selectedSYRecentAdded: "", // default to "All" for recent added filter
      studentsRecentAdded: [],
      students: [],
      studentStats: {},
      selectedYearDocs: "2024 - 2025",
      selectedYearBarChart: "",
      years: [], // will be set dynamically from API
      data: {
        "2023 - 2024": { releasedDocs: 0, seniorHigh: 0, juniorHigh: 0 },
        "2022 - 2023": { releasedDocs: 0, seniorHigh: 0, juniorHigh: 0 },
        "2024 - 2025": { releasedDocs: 0, seniorHigh: 0, juniorHigh: 0 }
      },
      loading: false,
      error: null,
      genderDistribution: {},
    };
  },
  async created() {
    await this.fetchDashboardData();
    await this.fetchAvailableGenderDistributionYears();
    await this.fetchGenderDistribution();
  },
  watch: {
    selectedYearBarChart: {
      immediate: false,
      handler(newVal) {
        this.fetchGenderDistribution();
      }
    }
  },
  computed: {
    releasedStudents() {
      let filtered = this.students;
      if (this.selectedSY) {
        filtered = filtered.filter(student => student.school_year === this.selectedSY);
      }
      const start = (this.currentPage - 1) * this.itemsPerPage;
      return filtered.slice(start, start + this.itemsPerPage);
      },
      totalPages() {
        return Math.ceil(this.releasedStudents.length / this.itemsPerPage);
      },
      uniqueSYs() {
        return [...new Set(this.students.map(student => student.school_year))];
      },
      filteredStats() {
        return this.selectedCurriculum ? this.studentStats[this.selectedCurriculum] || [] : [];
      },
      getUniqueschool_yeares() {
      return [...new Set(this.students.map(student => student.school_year))];
      },
      filteredStudents() {
        return this.selectedSY
          ? this.students.filter(student => student.school_year === this.selectedSY)
          : this.students;
      },
      uniqueSYsRecentAdded() {
        return [...new Set(this.studentsRecentAdded.map(student => student.school_year))];
      },
      filteredRecentAddedStudents() {
        return this.selectedSYRecentAdded
          ? this.studentsRecentAdded.filter(student => student.school_year === this.selectedSYRecentAdded)
          : this.studentsRecentAdded;
      },
      filteredData() {
        return this.data[this.selectedYearDocs];
      },
      barChartData() {
        // Use genderDistribution.data as per new response structure
        const dist = (this.genderDistribution && this.genderDistribution.data) ? this.genderDistribution.data : {};
        return {
          labels: ['JHS Male', 'JHS Female', 'SHS Male', 'SHS Female'],
          datasets: [
            {
              label: 'Total Students',
              backgroundColor: ['#295f98', '#295f98', '#295f98', '#295f98'],
              data: [
                dist.JHS_M || 0,
                dist.JHS_F || 0,
                dist.SHS_M || 0,
                dist.SHS_F || 0
              ]
            }
          ]
        };
      },
    },
  
  methods: {
    async fetchDashboardData() {
      this.loading = true;
      try {
        const [
          studentStats,
          recentStudents,
          releasedDocsStats,
          statusCounts
        ] = await Promise.all([
          DashboardService.getStudentStats(),
          DashboardService.getRecentStudents(),
          DashboardService.getReleasedDocsStats(),
          DashboardService.getStudentStatusCounts()
        ]);

        this.studentsRecentAdded = Array.isArray(recentStudents.data)
          ? recentStudents.data.map(student => ({
              name: `${student.LastName}, ${student.FirstName}${student.Suffix ? ' ' + student.Suffix : ''}`,
              track: student.Track,
              school_year: student.Grade_Level,
              lrn: student.LRN,
              releaseDate: student.created_at // or another date field if needed
            }))
          : [];

        // For demo: show the same students in the table
        this.students = this.studentsRecentAdded;

        this.studentStats = this.processStudentStats(studentStats);
        this.data = this.processReleasedDocsData(releasedDocsStats);
        // this.genderDistribution = genderDistribution; // assign directly, not .data

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        this.error = 'Failed to load dashboard data';
      } finally {
        this.loading = false;
      }
    },
    async fetchGenderDistribution() {
      try {
        // Always send sy_year in backend format (no spaces)
        const params = this.selectedYearBarChart
          ? { sy_year: this.selectedYearBarChart }
          : {};
        const genderDistribution = await DashboardService.getGenderDistribution(params);
        this.genderDistribution = genderDistribution;
      } catch (error) {
        this.genderDistribution = {};
      }
    },
    async fetchAvailableGenderDistributionYears() {
      try {
        // Fetch all available years for gender distribution
        const response = await DashboardService.getGenderDistributionYears();
        // Ensure response is an array of year strings, e.g. ["2022-2023", "2023-2024", "2024-2025"]
        this.years = Array.isArray(response) ? response : [];
        // Set default selected year if not set and years are available
        if (!this.selectedYearBarChart && this.years.length > 0) {
          this.selectedYearBarChart = "";
        }
      } catch (error) {
        this.years = [];
      }
    },
    processStudentStats(stats) {
      return {
        "JHS Grade 7": [
          { label: "SPJ Students", count: stats.track_stats['SPJ'] || 0 },
          { label: "BEC Students", count: stats.track_stats['BEC'] || 0 },
          { label: "SPA Students", count: stats.track_stats['SPA'] || 0 },
        ],
        // Add other grade levels similarly
      };
    },

    processReleasedDocsData(stats) {
      return {
        "2024 - 2025": {
          releasedDocs: stats.released_docs['2024 - 2025'] || 0,
          seniorHigh: stats.curriculum_stats['SHS'] || 0,
          juniorHigh: stats.curriculum_stats['JHS'] || 0
        },
        // Add other years similarly
      };
    },

    formatDate(date) {
      return new Intl.DateTimeFormat("en-US", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true
      }).format(new Date(date));
    },

    prevPage() {
      if (this.currentPage > 1) {
        this.currentPage--;
      }
    },

    nextPage() {
      if (this.currentPage < this.totalPages) {
        this.currentPage++;
      }
    }
  }
};
</script>

<style scoped>
.loading {
  text-align: center;
  padding: 2rem;
  font-size: 1.2rem;
  color: #666;
}

.error {
  text-align: center;
  padding: 2rem;
  color: #dc3545;
  font-size: 1.2rem;
}

.total-students {
  width: 100%;
  padding: 40px;
  background: #fff;
  border-radius: 10px;
}

.container-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.content-title h3 {
  margin: 0;
  font-size: 1.2rem;
  font-weight: bold;
}

.filter select {
  padding: 15px 20px;
  font-size: 1rem;
  border: 1px solid #ccc;
  border-radius: 5px;
}

.chart-container {
  width: 100%;
  height: 450px; 
  display: flex;
  justify-content: center;
}

.container {
  margin-top: 70px;
  margin-left: 290px;
  width: 125%;
  padding: 10px;
  box-sizing: border-box;
}

.nav-title h1 {
  color: #295f98;
  font-weight: bold;
  font-size: 48px;
  padding: 0;
  margin: 0;
}

.dashboard-content {
  display: flex;
  flex-direction: column;
  width: 100%;
}

.student-container {
  background-color: #ffffff;
  padding: 10px 20px;
  border-radius: 5px;
  box-shadow: rgba(60, 64, 67, 0.3) 0px 1px 2px 0px,
    rgba(60, 64, 67, 0.15) 0px 2px 6px 2px;
  margin-bottom: 20px;
}

.buttons {
  display: flex;
  justify-content: space-between;
  color: #ffffff;
  flex-wrap: wrap;
  gap: 10px;
  margin: 20px 0;
}

.status.released {
  background: #0c5a48;
  color: white;
  padding: 5px 20px;
  border-radius: 5px;
  font-size: 12px;
}

.academic-year p,
.year-filter p {
  background-color: #295f98;
  padding: 15px 20px;
  border-radius: 3px;
  cursor: pointer;
  flex: 1;
  text-align: center;
  min-width: 120px;
}

.stats-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 15px;
  margin-bottom: 10px;
}

.stat-card {
  background-color: #f5f5f5;
  padding: 15px;
  display: flex;
  align-items: center;
  gap: 15px;
  text-align: left;
  border-radius: 5px;
  border: 1px solid #e0e0e0;
}

.stat-icon {
  font-size: 64px;
  min-width: 50px;
}

.stat-info h3 {
  font-size: 20px;
  font-weight: bold;
  margin: 0;
}

.stat-info p {
  font-size: 14px;
  color: gray;
  margin: 0;
}

.student-list-container {
  display: flex;
  gap: 20px;
}

.total-students,
.recent-added,
.recent-released,
.released-docs {
  background-color: #ffffff;
  padding: 20px;
  border-radius: 5px;
  box-shadow: rgba(60, 64, 67, 0.3) 0px 1px 2px 0px,
    rgba(60, 64, 67, 0.15) 0px 2px 6px 2px;
  margin-bottom: 20px;
}

.recent-added {
  width: 300px; 
  height: 550px; 
  overflow-y: auto; 
  border: 1px solid #ddd; 
  padding: 20px;
  background-color: #ffffff;
}

.title-filter-container {
  display: flex;
  align-items: center;
  justify-content: space-between; 
  width: 100%;
}

.filter-container-recent-added select {
  padding: 15px 20px;
  font-size: 14px;
  min-width: 150px; 
}

.total-students {
  width: 75%;
  height: 40%;
  min-height: 500px;
}

.recent-added,
.recent-released,
.released-docs {
  width: 25%;
}

.recent-added ul,
.recent-released ul,
.released-docs ul {
  list-style-type: decimal;
  padding-left: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.recent-added li,
.recent-released li,
.released-docs li {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  border-radius: 10px;
  font-size: 14px;
  background-color: #f5f5f5;
}

.list-number {
  font-weight: bold;
  margin-right: 8px;
}

.container-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.filter-container {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.filter-container label {
  font-weight: bold;
  color: #295f98;
}

select {
  padding: 15px 20px;
  width: 180px;
  border: 1px solid #295f98;
  border-radius: 5px;
  font-size: 14px;
  background: #fff;
  font-weight: bold;
  color: #295f98;
  cursor: pointer;
  appearance: none;
  position: relative;
  background-repeat: no-repeat;
  background-position: right 10px center;
  padding-right: 30px;
  transition: all 0.3s ease-in-out;
  background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' width='18' height='18' fill='%23295f98'><path d='M14 7l-5 5 5 5V7z'/></svg>");
}

select:hover,
select:focus {
  border-color: #1f4b7a;
  box-shadow: 0 0 5px rgba(41, 95, 152, 0.5);
  background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' width='18' height='18' fill='%23295f98'><path d='M7 10l5 5 5-5H7z'/></svg>");

}

.document-list-container {
  display: flex;
  gap: 20px;
  align-items: stretch;
}

.recent-released {
  height: 600px;
}
.released-docs {
  height: 558px;
}

.content-title-docs {
  align-items: center; 
  display: flex;
  justify-content: space-between;
  width: 100%; 
}
.content-title-docs h3 {
  margin: 0;
}

.year-filter {
  border: 1px solid #ccc;
  border-radius: 5px;
  padding: 15px 20px;
  font-size: 14px;
  border-color: #1f4b7a;
}

.circle-container {
  display: flex;
  justify-content: center;
  margin-top: 50px;
}

.circle {
  width: 230px;
  height: 230px;
  border-radius: 50%;
  border: 20px solid #1E3A8A;
  display: flex;
  flex-direction: column; /* Align items in a column */
  align-items: center;
  justify-content: center;
  font-size: 20px;
  font-weight: bold;
  color: #333;
  text-align: center;
}

.doc-number {
  font-size: 24px;
  font-weight: bold;
}

.doc-text {
  font-size: 16px;
  color: #666;
  margin-top: 5px; 
}

.stats-doc {
  display: flex;
  justify-content: space-between;
  margin-top: 60px;
  gap: 10px; 
}

.stat-box-doc {
  background: #f0f0f0;
  border-radius: 5px;
  padding: 15px;
  width: 45%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.stat-number-doc {
  font-size: 24px;
  font-weight: bold;
  margin: 0;
}

.stat-label-container-doc {
  display: flex;
  align-items: center;
  margin-top: 5px;
}

.stat-icon-doc {
  width: 10px; 
  height: 40px; 
  background-color: #1E3A8A; 
  margin-right: 8px;
  border-radius: 10px; 
}

.stat-label-doc {
  font-size: 13px;
  color: #666;
  margin: 0;
}

.recent-released {
  width: 74.8%;
  margin-top: -37px;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th, td {
  padding: 10px;
  border: 1px solid #ddd;
  text-align: left;
}

td {
  font-size: 14px;
}

th {
  background-color: #f4f4f4;
  font-weight: bold;
}
</style>
