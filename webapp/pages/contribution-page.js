export default {
	name: 'contribution-page',
	template: `
  <v-container>
    <div class="text-h4 py-4">
      Contributions
    </div>
    <div class="my-2 text-h5">Edition</div>
    <div><v-btn v-for="e in editions" :key="e" class="my-2 mr-1" :to="contributionURL(e)" :exact="false">{{ e }}</v-btn></div>

    <div class="my-2 text-h5">Search</div>
    <div class="my-2">
      <v-text-field
        v-model="searchInput"
        :append-outer-icon="searchInput ? 'mdi-send' : undefined"
        filled
        clear-icon="mdi-close"
        clearable
        placeholder="Search texture name or author"
        type="text"
        v-on:keyup.enter="startSearch"
        @click:append-outer="startSearch"
        @click:clear="clearSearch"
      ></v-text-field>
    </div>

    <div class="my-2">
      <v-row>
        <v-col cols="3" v-for="c in contributions" :key="c">{{ JSON.stringify(c) }}</v-col>
      </v-row>
    </div>
  </v-container>`,
	data() {
		return {
      editions: ['java', 'bedrock'],
      resolutions: ['c32', 'c64'],
      addElseRemoveAuthorLabels: ['Add author', 'Remove author'],
      formData : {
        edition: 'java',
        resolution: 'c32',
  
        texturePath: '/item/bucket',
  
        addElseRemoveAuthor: true,
        discordTag: 'TheRolf#8604',
        
        pushToGithub: false,
  
        password: "TheRolfIsTheBest",
      },
      searchInput: '',
      contributions: []
		}
	},
  computed: {
    edition: function() {
      return this.$route.params.edition
    },
    search: function() {
      return this.$route.params.search
    }
  },
  methods: {
    contributionURL: function(edition) {
      const path = this.$route.path.split('/')

      // find edition in split path
      let editionIndex = -1
      let i = 0
      while(i < path.length && editionIndex == -1) {
        if(this.editions.includes(path[i]))
          editionIndex = i

        ++i
      }

      path.splice(editionIndex)

      path.push(edition)

      if(this.search)
        path.push(this.search)

      path.push('')
      
      return path.join('/')
    },
    getContributions: function() {
      axios.get('/contributions/' + this.edition + '/' + (this.search ? this.search + '/' : ''))
      .then(res => {
        this.contributions = res
      })
      .catch(err => { this.$root.showSnackBar(err, 'error') })
    },
    send() {
      const data = JSON.parse(JSON.stringify(this.formData))
      data.password = makeid(24)
      
      axios.post('http://localhost:3000/contributor', data)
      .then(function (response) {
        console.log(response);
      })
      .catch(function (error) {
        console.log(error);
      });
    },
    startSearch: function() {
      // ok so url is /whatever/<edition>/ => /whatever/<edition>/<search>/
      // ok so url is /whatever/<edition>/<oldSearch>/ => /whatever/<edition>/<newSearch>/
      const path = this.$route.path.split('/')

      // find edition in split path
      let editionIndex = -1
      let i = 0
      while(i < path.length && editionIndex == -1) {
        if(this.editions.includes(path[i]))
          editionIndex = i

        ++i
      }
      
      path.splice(editionIndex + 1)

      if(this.searchInput) {
        path.push(this.searchInput)
      }

      path.push('')
      const newPath = path.join('/')

      if(newPath === this.$route.path) {
        console.warn(newPath)
      } else {
        this.$router.push(newPath)
      }
    },
    clearSearch: function() {
      // ok so url is /whatever/<edition>/ => /whatever/<edition>/<search>/
      // ok so url is /whatever/<edition>/<oldSearch>/ => /whatever/<edition>/<newSearch>/
      const path = this.$route.path.split('/')

      // find edition in split path
      let editionIndex = -1
      let i = 0
      while(i < path.length && editionIndex == -1) {
        if(this.editions.includes(path[i]))
          editionIndex = i

        ++i
      }
      
      path.splice(editionIndex + 1)
      path.push('')

      const newPath = path.join('/')

      if(newPath === this.$route.path) {
        console.warn(newPath)
      } else {
        this.$router.push(newPath)
      }
    }
  },
  watch: {
    $route() {
      this.getContributions()
    }
  },
  mounted: function() {
    this.searchInput = this.search
    this.getContributions()
  }
}