const ContributorModal = () => import('./contributor-modal.js')
const ContributorRemoveConfirm = () => import('./contributor-remove-confirm.js')

export default {
	name: 'contributor-page',
  components: {
    ContributorModal,
    ContributorRemoveConfirm
  },
	template: `
    <v-container>
      <contributor-modal :dialog="dialogOpen" :disableDialog="disableDialog" :add="Object.keys(dialogData).length == 0" :data="dialogData" :types="types"></contributor-modal>
      <div class="text-h4 py-0">
        Contributors
      </div>
      <div>
        <div class="my-2 text-h5">Select contributor type</div>
        <div><v-btn v-for="t in contributorTypes" :key="t" :class="{ 'my-2': true, 'mr-1': true, 'v-btn--active': t === 'All' && !type && !!name }" :to="contributorURL(t)" :exact="t == 'All'">{{ t }}</v-btn></div>
        <div class="my-2 text-h5">Search username</div>
        <div class="my-2">
          <v-text-field
            v-model="search"
            :append-outer-icon="search ? 'mdi-send' : undefined"
            filled
            clear-icon="mdi-close"
            clearable
            label="Username"
            type="text"
            v-on:keyup.enter="startSearch"
            @click:append-outer="startSearch"
            @click:clear="clearSearch"
        ></v-text-field>

        <v-btn block color="secondary" @click="openDialog()">Add new Contributor <v-icon right dark>mdi-plus</v-icon></v-btn>

        <div class="my-2 text-h5">Contributor results</div>
        <v-list v-if="contributors.length" two-line color="rgba(255, 255, 255, 0.08)">
          <v-row><v-col :cols="12/listColumns" xs="1"
              v-for="(contrib_arr, index) in splittedContributors"
              :key="index"
            >
            <v-list-item
              v-for="contrib in contrib_arr"
              :key="contrib.id"
            >
              <v-list-item-avatar>
                <v-img v-if="contrib.uuid" :src="'https://crafatar.com/renders/head/' + contrib.uuid + '?default=MHF_Alex&overlay'" />
                <v-icon v-else style="background: #4e4e4e">mdi-account</v-icon>
              </v-list-item-avatar>

              <v-list-item-content>
                <v-list-item-title v-text="contrib.username"></v-list-item-title>

                <v-list-item-subtitle v-text="contrib.type"></v-list-item-subtitle>
              </v-list-item-content>

              <v-list-item-action>
                <v-btn icon @click="openDialog(contrib)">
                  <v-icon color="white lighten-1">mdi-pencil</v-icon>
                </v-btn>
              </v-list-item-action>
              <v-list-item-action>
                <v-btn icon @click="askRemove(contrib.username)">
                  <v-icon color="white lighten-1">mdi-delete</v-icon>
                </v-btn>
              </v-list-item-action>
            </v-list-item>
          </v-col></v-row>
        </v-list>
        <div v-else><i>No results found.</i></div>
        </div>
      </div>
      <contributor-remove-confirm :confirm="remove.confirm" :disableDialog="function() { remove.confirm = false; update() }" :username="remove.username"></contributor-remove-confirm>
    </v-container>`,
	data() {
		return {
      recompute: false,
      types: [],
      search: '',
      formData: {
        username: '',
        type: '',
        id: 0,
        uuid: '',
        pushToGithub: false
      },
      contributors: [],
      dialogOpen: false,
      dialogData: {},
      remove: {
        confirm: false,
        username: ''
      }
		}
	},
  methods: {
    contributorURL(t) {
      if(t == 'All') {
        return "/contributors/" + (this.name || '')
      }
      return "/contributors/" + (t !== 'All' ? t : '')  + (this.name ? '/' + this.name : '')
    },
    send() {
      const data = JSON.parse(JSON.stringify(this.formData))
      
      axios.post('http://localhost:3000/contributor', data)
      .then(function (response) {
        console.log(response);
      })
      .catch(function (error) {
        console.log(error);
      });
    },
    startSearch: function() {
      // ok so url is /whatever/ => /whatever/<search>
      // ok so url is /whatever/<oldSearch> => /whatever/<search>
      // ok so url is /whatever/<type> =>/whatever/<type>/<search>
      // ok so url is /whatever/<type>/<name> => /whatever/<type>/<search>
      let newPath
      if(this.name) {
        var splitted = this.$route.path.split('/')
        splitted.pop()
        newPath = splitted.join('/')
      } else {
        newPath = this.$route.path
      }

      if(!newPath.endsWith('/'))
        newPath += '/'

      newPath += this.search

      if(newPath === this.$route.path) {
        console.warn(newPath)
      } else {
        this.$router.push(newPath)
      }
    },
    getTypes: function() {
      axios.get('/contributors/types')
      .then((response) => {
        this.types = response.data
      })
      .catch(function (error) {
        console.error(error);
      })
      .finally(() => {
        Vue.nextTick(() => {
          this.search = this.name
        })
      })
    },
    getContributors: function() {
      axios.get(this.$route.path)
      .then((response) => {
        this.contributors = response.data
      })
      .catch(function (error) {
        console.error(error)
      })
    },
    update: function() {
      this.getTypes()
      this.getContributors()
    },
    clearSearch: function() {
      this.search = ''
      this.startSearch()
    },
    openDialog: function(data = {}) {
      this.dialogOpen = true
      this.dialogData = data
    },
    disableDialog: function(refresh = false) {
      this.dialogOpen = false

      if(refresh) {
        this.getTypes()
        this.getContributors()
      }
    },
    askRemove: function(username) {
      this.remove.confirm = true
      this.remove.username = username
    }
  },
  computed: {
    contributorTypes: function() {
      return ['All', ...this.types]
    },
    type: function() {
      if(this.$route.params.type && this.types.includes(this.$route.params.type)) {
        return this.$route.params.type
      }
      return undefined
    },
    name: function() {
      if(this.type !== undefined) {
        return this.$route.params.name
      }

      return this.$route.params.type
    },
    listColumns: function() {
      let columns = 1

      if(this.$vuetify.breakpoint.mdAndUp && this.contributors.length >= 6) {
        columns = 2
        if(this.$vuetify.breakpoint.lgAndUp && this.contributors.length >= 21) {
          columns = 3
        }
      }

      return columns
    },
    splittedContributors: function() {
      let res = []
      for(let col = 0; col < this.listColumns; ++col) {
        res.push([])
      }

      let arrayIndex = 0;
      this.contributors.forEach(contrib => {
        res[arrayIndex].push(contrib)
        arrayIndex = (arrayIndex + 1) % this.listColumns
      })

      return res
    }
  },
  watch: {
    $route() {
      this.getContributors()
    }
  },
  mounted: function() {
    this.update()
  }
}