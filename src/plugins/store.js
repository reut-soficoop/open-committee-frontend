import Vue from "vue";
import Vuex from "vuex";
import createPersistedState from "vuex-persistedstate";
import { request } from "graphql-request";
import {
  MutationTypes,
  ActionTypes,
  Getters,
  graphqlEndpoint,
  authEndpoint
} from "../helpers/constants";
import { dateTimeRevive, makeGqlRequest } from "../helpers/functions";
import {
  getMeetings,
  getMeeting,
  getPlan,
  getCommitteeMeetings,
  getCommittees
} from "../helpers/queries.js";

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    /**@type {import("../../graphql/types").Meeting[]} */
    upcomingMeetigs: [],
    /**@type {import("../../graphql/types").Meeting} */
    selectedMeeting: null,
    plans: [],
    selectedPlan: null,
    jwt: "",
    /**@type {import("../../graphql/types").UsersPermissionsUser} */
    user: null,
    /** @type {import("../../graphql/types").Meeting[]} */
    managableMeetings: []
  },
  mutations: {
    /**
     * Sets the current user by the given user
     * @param {any} state The current state
     * @param {import("../../graphql/types").UsersPermissionsUser} user
     */
    [MutationTypes.SET_USER](state, user) {
      state.user = user;
    },
    /**
     * Sets the upcoming meetings in state by given meeting array
     * @param {any} state The current state
     * @param {import("../../graphql/types").Meeting[]} payload Meetings to set as upcoming meetings
     */
    [MutationTypes.SET_UPCOMING_MEETINGS](state, payload) {
      state.upcomingMeetigs = payload;
    },
    /**
     * Sets the selected meeting in state by a given meeting
     * @param {any} state The current state
     * @param {import("../../graphql/types").Meeting} meeting Meeting to set as the selected meeting
     */
    [MutationTypes.SET_SELECTED_MEETING](state, meeting) {
      const meetingIndexInState = state.upcomingMeetigs.findIndex(
        m => m.id == meeting.id
      );
      if (meeting.date > new Date()) {
        if (meetingIndexInState == -1) {
          state.upcomingMeetigs.push(meeting);
        } else {
          state.upcomingMeetigs[meetingIndexInState] = meeting;
        }
      }
      state.selectedMeeting = meeting;
    },
    /**
     * Sets the selected plan in state by a given plan
     * @param {any} state The current state
     * @param {import("../../graphql/types").Plan} plan Plan to set as the selected plan
     */
    [MutationTypes.SET_SELECTED_PLAN](state, plan) {
      const planIndexInState = state.plans.findIndex(p => p.sid == plan.sid);
      if (planIndexInState == -1) {
        state.plans.push(plan);
      } else {
        state.plans[planIndexInState] = plan;
      }
      state.selectedPlan = plan;
    },
    [MutationTypes.SET_JWT](state, jwt) {
      state.jwt = jwt;
    },
    [MutationTypes.SET_MANAGABLE_MEETINGS](state, meetings) {
      state.managableMeetings = meetings;
    }
  },
  getters: {
    [Getters.UPCOMING_MEETINGS](state) {
      return state.upcomingMeetigs;
    },
    [Getters.SELECTED_MEETING](state) {
      return state.selectedMeeting;
    },
    [Getters.SELECTED_PLAN](state) {
      return state.selectedPlan;
    },
    [Getters.JWT](state) {
      return state.jwt;
    },
    [Getters.USER](state) {
      return state.user;
    },
    [Getters.MANAGABLE_MEETINGS](state) {
      return state.managableMeetings;
    }
  },
  actions: {
    /**
     * Fetches upcoming meeting (partial)
     * @param {import("vuex").Store} context The store object
     */
    async [ActionTypes.FETCH_UPCOMING_MEETINGS](context) {
      let date = new Date();
      date.setHours(0);
      const res = await makeGqlRequest(getMeetings, { date: date });
      let meetings = res.meetings.filter(meeting => meeting.committee);
      context.commit(MutationTypes.SET_UPCOMING_MEETINGS, meetings);
    },
    [ActionTypes.SET_MEETING](context, meeting) {
      context.commit(MutationTypes.SET_SELECTED_MEETING, meeting);
    },
    /**
     * Sign ups a user
     * @param {import("../../graphql/types").UsersPermissionsUser} user
     */
    async [ActionTypes.SIGN_UP](context, user) {
      user.username = user.email;
      const res = await fetch(`${authEndpoint}/register`, {
        method: "post",
        body: JSON.stringify(user),
        headers: { "Content-Type": "application/json" }
      });
      const result = await res.json();
      if (result.jwt) {
        context.commit(MutationTypes.SET_JWT, result.jwt);
        context.commit(MutationTypes.SET_USER, result.user);
        return true;
      }
      return false;
    },
    /**
     * Performs sign in
     * @param {import("vuex").Store} context The store object
     * @param {import("../../graphql/types").UsersPermissionsUser} user user to sign in
     */
    async [ActionTypes.SIGN_IN](context, user) {
      const res = await fetch(`${authEndpoint}`, {
        method: "post",
        body: JSON.stringify({
          identifier: user.email,
          password: user.password
        }),
        headers: { "Content-Type": "application/json" }
      });
      const result = await res.json();
      if (result.jwt) {
        if (result.user.committees) {
          const userCommitteesResult = await request(
            graphqlEndpoint,
            getCommittees,
            {
              committees: result.user.committees
            }
          );
          result.user.committees = userCommitteesResult.committees;
        }
        context.commit(MutationTypes.SET_JWT, result.jwt);
        context.commit(MutationTypes.SET_USER, result.user);
        return true;
      }
      return false;
    },
    /**
     * Signs out the user by removing the user-related data from the store
     */
    [ActionTypes.SIGN_OUT](context) {
      context.commit(MutationTypes.SET_JWT, "");
      context.commit(MutationTypes.SET_USER, null);
      context.commit(MutationTypes.SET_MANAGABLE_MEETINGS, []);
    },
    /**
     * Fetches a meeting by its ID
     * @param {import("vuex").Store} context the store object
     * @param {stirng} id ID of meeting to fetch
     */
    async [ActionTypes.FETCH_MEETING](context, id) {
      const { meeting } = await makeGqlRequest(getMeeting, { id: id });
      context.commit(MutationTypes.SET_SELECTED_MEETING, meeting);
    },
    /**
     * Fetches a plan by its ID
     * @param {import("vuex").Store} context the store object
     * @param {string} id ID of plan to fetch
     */
    async [ActionTypes.FETCH_PLAN](context, id) {
      const { plan } = await makeGqlRequest(getPlan, { id: id });
      context.commit(MutationTypes.SET_SELECTED_PLAN, plan);
    },
    /**
     * Fetches managable meetings
     * @param {import("vuex").Store} context the store object
     */
    async [ActionTypes.FETCH_MANAGABLE_MEETINGS](context) {
      if (context.state.user.role.name != "Administrator") {
        return;
      }
      const res = await makeGqlRequest(getCommitteeMeetings, {
        committees: context.state.user.committees.map(committee => committee.id)
      });
      /** @type {import("../../graphql/types").Meeting[]} */
      const meetings = res.meetings;
      context.commit(MutationTypes.SET_MANAGABLE_MEETINGS, meetings);
    }
  },
  plugins: [
    createPersistedState({
      arrayMerger(store, saved) {
        return JSON.parse(JSON.stringify(saved), dateTimeRevive);
      }
    })
  ]
});
