<template>
  <v-layout wrap>
    <v-flex xs12 sm6 md4 v-for="item in items" :key="item.id" pa-1>
      <v-hover
        v-slot:default="{ hover }"
        :disabled="$vuetify.breakpoint.smAndDown"
      >
        <v-expand-transition>
          <v-card
            tabindex="0"
            color="accent"
            dark
            height="100%"
            hover
            @click.stop="item.click && item.click()"
            :ripple="!!item.click"
          >
            <v-slide-y-transition mode="out-in">
              <v-layout
                class="primary"
                wrap
                v-if="hover || hoveredItem == item.id"
                fill-height
                align-content-center
                absolute
              >
                <v-flex
                  xs12
                  ma-1
                  px-2
                  v-for="bullet in item.bullets"
                  :key="bullet.key"
                >
                  <div v-if="bullet.key && bullet.value">
                    <span class="teal--text text--accent-2">{{
                      bullet.key + ": "
                    }}</span>
                    <span>{{ bullet.value }}</span>
                  </div>
                </v-flex>
                <v-flex xs12 ma-3 v-if="areCardsRemovable">
                  <v-btn color="error" @click.stop="emitRemoveClicked(item.id)">
                    מחיקה
                  </v-btn>
                </v-flex>
              </v-layout>
              <v-layout wrap v-else tag="section">
                <v-card-text class="subtitle-2" tabindex="0">
                  <v-icon small>mdi-clipboard-text</v-icon>
                  {{ item.headline }}
                </v-card-text>
                <v-card-title class="title" tabindex="0">
                  {{ item.description }}
                </v-card-title>
              </v-layout>
            </v-slide-y-transition>
          </v-card>
        </v-expand-transition>
      </v-hover>
    </v-flex>
  </v-layout>
</template>
<script>
import Component from "vue-class-component";
import Vue from "vue";
import { Prop } from "vue-property-decorator";

@Component
export default class AgendaCards extends Vue {
  @Prop(Boolean) areCardsRemovable;
  @Prop(String) hoveredItem;
  /** @type {import("../helpers/typings").AgendaCard[]} */
  @Prop(Array) items;

  emitRemoveClicked(index) {
    this.$emit("cardRemoved", index);
  }
}
</script>
