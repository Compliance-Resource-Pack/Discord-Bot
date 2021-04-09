export default {
	name: 'contributor-modal',
	template: `
  <v-dialog
      v-model="dialog"
      persistent
      max-width="600"
    >
      <v-card>
        <v-card-title class="headline" v-text="dialogTitle"></v-card-title>
        <v-card-text>
          <v-row>
            <v-col v-if="formData.uuid" class="col-2" :sm="$vuetify.breakpoint.mdAndUp ? 3 : 2">
              <img alt="avatar" style="width: 100%; max-width: 250" :src="($vuetify.breakpoint.mdAndUp ? 'https://crafatar.com/renders/body/' : 'https://crafatar.com/renders/head/') + formData.uuid + '?default=MHF_Alex&scale=10&overlay'" />
            </v-col><v-col :class="'col-' + formData.uuid ? '10' : '12'" :sm="formData.uuid ? ($vuetify.breakpoint.mdAndUp ? 9 : 10) : 12">
              <v-form ref="form" lazy-validation>
                <v-text-field required clearable v-model="formData.username" label="Username"></v-text-field>

                <v-select required v-model="formData.type" :items="types" label="Contributor type"></v-select>
        
                <v-text-field required clearable v-model="formData.uuid" label="Minecraft profile UUID"></v-text-field>
        
                <v-text-field required clearable type="password" v-model="formData.password" label="Security password" hint="must match .env password"></v-text-field>
                
                <v-checkbox required v-model="formData.pushToGithub" label="Push to GitHub"></v-checkbox>
              </v-form>
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="grey darken-1"
            text
            @click="disableDialog"
          >
            Cancel
          </v-btn>
          <v-btn
            color="darken-1"
            text
            @click="send"
          >
            Save
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  `,
  props: {
    dialog: {
      type: Boolean,
      required: true
    },
    disableDialog: {
      type: Function,
      required: true
    },
    add: {
      type: Boolean,
      required: false,
      default: false
    },
    data: {
      type: Object,
      required: true
    },
    types: {
      type: Array,
      required: false,
      default: function() { return ['member'] }
    }
  },
	data() {
		return {
      formData: {
        username: '',
        type: undefined,
        uuid: '',
        password: 'NeverGonnaGiveYouUp',
        pushToGithub: true
      }
		}
	},
  computed: {
    dialogTitle: function() {
      return (this.add ? 'Add new' : 'Change') + ' contributor'
    }
  },
  methods: {
    send: function() {
      const data = JSON.parse(JSON.stringify(this.formData))
      data.password = TwinBcrypt.hashSync(data.password)
      
      axios.post('/contributors/change', data)
      .then(_response => {
        this.$root.showSnackBar('Ended successully', 'success')
        this.disableDialog(true)
      })
      .catch(error => {
        console.error(error)
        this.$root.showSnackBar(`${error.message} : ${error.response.data.error}`, 'error')
        this.disableDialog(true)
      });
    }
  },
  watch: {
    dialog: function(newValue, oldValue) {
      if(oldValue != newValue && newValue == true) {
        const pass = this.formData.password
        Vue.nextTick(() => {
          this.$refs.form.reset()
          Vue.nextTick(() => {
            this.formData.password = pass
          })

          if(!this.add) {
            const keys = Object.keys(this.data)
            keys.forEach(key => {
              this.formData[key] = this.data[key]
            })
          }
        })
      }
    }
  }
}