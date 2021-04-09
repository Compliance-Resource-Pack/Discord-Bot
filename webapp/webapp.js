const ContributionPage = () => import('./pages/contribution-page.js')
const ContributorPage = () => import('./pages/contributor-page.js')

Vue.config.devtools = location.hostname === 'localhost' || location.hostname === '127.0.0.1'

const routes = [
	{ path: '/', redirect: '/contributions/java/' },
	{ path: '/contributions/', redirect: '/contributions/java/' },
	{ path: '/contributions?/:edition/:path?/?', component: ContributionPage },
  { path: '/contributors/:type?/:name?/', component: ContributorPage }
]

const router = new VueRouter({ routes })

let v = new Vue({
	router,
	el: '#app',
  data: {
    tabs: [
      { to : "/contributions/", label: "Contributions" },
      { to : "/contributors/", label : "Contributors" }
    ],
    currenttab: undefined,
    bg: 'transparent',
    snackbar: {
      show: false,
      message: '',
      color: '#222',
      timeout: 20000
    }
  },
  computed: {
    tabselected: function() {
      let res = undefined;

      let i = 0;
      while(i < this.tabs.length && !res) {
        if(this.$route.path.startsWith(this.tabs[i].to))
          res = this.tabs[i].to
        ++i;
      }

      if(!res)
        res = this.tabs[0].to;
      
      return res;
    },
    year: function() {
      return new Date().getFullYear()
    }
  },
  methods: {
    changeColor() {
      if (
        document.body.scrollTop > 100 ||
        document.documentElement.scrollTop > 100
      ) {
        this.bg = '';
      } else {
        this.bg = 'transparent';
      }
    },
    showSnackBar: function(message, color = '#222', timeout = 2000) {
      this.snackbar.message = message
      this.snackbar.color = color
      this.snackbar.timeout = timeout
      this.snackbar.show = true
    }
  },
  mounted: function() {
    window.onscroll = () => {
      this.changeColor()
    }
  },
  vuetify: new Vuetify({
    theme: {
      dark: true,
      themes: {
        dark: {
          primary: '#fafafa',
          success: '#22a831',
        },
      }
    },
  }),
})