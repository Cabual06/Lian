import { defineStore } from 'pinia';
import { supabase } from '@/lib/supabaseClient';

export const useEventStore = defineStore('eventStore', {
  state: () => ({
    events: [], // List of events
    rounds: [], // List of rounds
  }),
  actions: {
    // Fetch Rounds
    async fetchRounds() {
      try {
        const { data, error } = await supabase.from('Round').select('id, name');
        if (error) throw error;
        this.rounds = data || [];
      } catch (error) {
        console.error('Error fetching rounds:', error.message);
      }
    },

    // Fetch Events (for the table)
    async fetchEvents({ page, itemsPerPage }) {
      try {
        const { data, error, count } = await supabase
          .from('Event')
          .select('*', { count: 'exact' })
          .range((page - 1) * itemsPerPage, page * itemsPerPage - 1);

        if (error) throw error;

        return { data, total: count || 0 }; // Return fetched events and total count
      } catch (error) {
        console.error('Error fetching events:', error.message);
        return { data: [], total: 0 };
      }
    },

    // Save Event
    async saveEvent(newEvent) {
      try {
        // Step 1: Insert Event
        const { data: eventData, error: eventError } = await supabase
          .from('Event')
          .insert({
            name: newEvent.name,
            description: newEvent.description,
            start_date: newEvent.start_date,
            end_date: newEvent.end_date,
            status: newEvent.status,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .single();

        if (eventError) throw eventError;

        // Step 2: Insert Event-Round Associations
        const roundAssociations = newEvent.selectedRoundIds.map((roundId) => ({
          Event_id: eventData.id,
          Round_id: roundId,
        }));

        const { error: roundsError } = await supabase.from('event_rounds').insert(roundAssociations);
        if (roundsError) throw roundsError;

        return eventData; // Return the created event data
      } catch (error) {
        console.error('Error saving event:', error.message);
        throw error; // Propagate error for handling in the component
      }
    },
  },
});
