export const getMeetings = `query getMeetings($date: String!){
  meetings(where: {date_gt: $date} sort: "date"){
    id
    date
    committee {
      sid
    }
  }
}`;

export const getMeeting = `query getMeeting($id: ID!){
  meeting(id: $id){
    id
    sid
    addedManually
    background
    number
    title
    date
    summary
    committee {
      id
      sid
      parent {
        sid
      }
      meetings(sort: "date:desc" where: {_id_ne: $id}) {
        id
        date
        number
        title
      }
    }
    plans {
      id
      type
      name
      number
      status
      lastUpdate
      location
    }
    protocol {
      id
      name
    }
    transcript {
      id
      name
    }
    decisions {
      id
      name
    }
    additionalFiles {
      id
      name
    }
  }
}`;

export const getPlan = `query getPlan($id: ID!) {
  plan(id: $id){
    id
    sid
    number
    lastUpdate
    location
    status
    sections
    name
    municipality
    settlement
    street
    houseNumber
    targets
    type
    meetings {
      id
      date
      number
      committee {
        sid
      }
    }
    attachedFiles {
      id
      name
      url
      size
    }
  }
}`;

export const getCommitteeMeetings = `query getCommitteeMeetings($committees: [ID]) {
  meetings(where: { committee_in: $committees, addedManually: true }) {
    id
    number
    date
    committee {
      id
      sid
    }
  }
}`;

export const getCommittees = `query getCommittees($committees: [ID]) {
  committees(where: {_id_in: $committees}) {
    id
    sid
  }
}`;

export const getPlans = `query plans($number: String) {
  plans(where: { number_contains: $number }) {
    id
    number
    name
  }
}`;
