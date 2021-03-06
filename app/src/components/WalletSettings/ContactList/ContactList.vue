<template>
  <div class="contact-list-container" :class="$vuetify.breakpoint.xsOnly ? '' : 'py-0 px-12'">
    <v-layout wrap>
      <v-flex xs12 md6 px-1 mb-1>
        <div class="body-2">{{ t('walletSettings.listContacts') }}</div>
        <v-card class="card-shadow mt-2">
          <v-list dense flat class="pa-0 contact-list">
            <template v-for="contact in contacts">
              <v-list-item :key="`contact-${contact.id}`" two-line>
                <v-list-item-content>
                  <v-list-item-title class="font-weight-regular caption">
                    <span>{{ contact.name }}</span>
                  </v-list-item-title>
                  <v-list-item-subtitle class="font-weight-regular caption text_2--text">
                    <span class="text-capitalize">{{ contact.verifier === ETH ? '' : `${contact.verifier}: ` }}</span>
                    <span>{{ contact.contact }}</span>
                  </v-list-item-subtitle>
                </v-list-item-content>
                <v-list-item-action>
                  <v-btn class="delete-btn" color="text_2" icon small :aria-label="`Delete ${contact.name}`" @click="deleteContact(contact.id)">
                    <v-icon>$vuetify.icons.close</v-icon>
                  </v-btn>
                </v-list-item-action>
              </v-list-item>
            </template>
          </v-list>
        </v-card>

        <div class="body-2 mt-4">{{ t('walletSettings.addNewContact') }}</div>

        <v-form ref="addContactForm" v-model="contactFormValid" lazy-validation @submit.prevent="addContact">
          <v-layout wrap class="mt-2">
            <v-flex xs12 sm8>
              <v-select
                id="select-verifier"
                v-model="selectedVerifier"
                class="select-verifier-container"
                outlined
                append-icon="$vuetify.icons.select"
                :items="verifierOptions"
                item-text="name"
                item-value="value"
                aria-label="Select Contact Verifier"
                @change="validateContactForm"
              ></v-select>
            </v-flex>
            <v-flex xs12>
              <v-text-field
                id="contact-name"
                v-model="newContactName"
                :placeholder="t('walletSettings.enterContact')"
                :rules="[rules.required]"
                outlined
                aria-label="Contact Name"
              ></v-text-field>
            </v-flex>
            <v-flex xs12>
              <v-text-field
                id="contact-value"
                v-model="newContact"
                :placeholder="verifierPlaceholder"
                :rules="[toAddressRule, rules.required, checkDuplicates]"
                outlined
                aria-label="Contact Value"
              ></v-text-field>
            </v-flex>

            <v-layout wrap>
              <v-flex xs12 sm12 md6 :class="$vuetify.breakpoint.xsOnly ? 'mt-2' : 'pl-2'">
                <v-btn id="contact-submit-btn" block type="submit" color="primary" depressed class="px-12 py-1" :disabled="!contactFormValid">
                  {{ t('walletSettings.addContact') }}
                </v-btn>
              </v-flex>
            </v-layout>
          </v-layout>
        </v-form>
      </v-flex>
    </v-layout>
  </div>
</template>

<script>
import log from 'loglevel'

import { ALLOWED_VERIFIERS, ETH } from '../../../utils/enums'
import { validateVerifierId } from '../../../utils/utils'

export default {
  name: 'NetworkSettings',
  data() {
    return {
      contactFormValid: true,
      selectedVerifier: ETH,
      newContact: '',
      newContactName: '',
      rules: {
        required: (value) => !!value || this.t('walletSettings.required'),
      },
      ETH,
    }
  },
  computed: {
    verifierOptions() {
      const verifiers = JSON.parse(JSON.stringify(ALLOWED_VERIFIERS))
      return verifiers.map((verifier) => {
        verifier.name = this.t(verifier.name)
        return verifier
      })
    },
    verifierPlaceholder() {
      const verifierLocale = ALLOWED_VERIFIERS.find((verifier) => verifier.value === this.selectedVerifier).name
      return `${this.t('walletSettings.enter')} ${this.t(verifierLocale)}`
    },
    contacts() {
      return this.$store.state.contacts
    },
  },
  methods: {
    checkDuplicates(value) {
      if (!this.contacts) return ''
      return this.contacts.findIndex((x) => x.contact.toLowerCase() === value.toLowerCase()) < 0 || this.t('walletSettings.duplicateContact')
    },
    async addContact() {
      if (!this.$refs.addContactForm.validate()) return
      const contact = this.newContact
      const name = this.newContactName
      this.newContact = ''
      this.newContactName = ''
      this.$refs.addContactForm.resetValidation()
      try {
        await this.$store.dispatch('addContact', {
          contact,
          name,
          verifier: this.selectedVerifier,
        })
      } catch (error) {
        log.error(error)
      }
    },
    deleteContact(contactId) {
      this.$store.dispatch('deleteContact', contactId)
    },
    toAddressRule(value) {
      return validateVerifierId(this.selectedVerifier, value)
    },
    validateContactForm() {
      if (this.$refs.addContactForm) this.$refs.addContactForm.validate()
    },
  },
}
</script>

<style lang="scss" scoped>
@import 'ContactList.scss';
</style>
