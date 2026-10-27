import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { SyntheticPrescription } from '../types';

export const prescriptionService = {
  /**
   * Fetches saved prescriptions for the user
   */
  async getPrescriptions(userId: string): Promise<SyntheticPrescription[]> {
    if (!userId) {
      return [];
    }

    if (!isSupabaseConfigured()) {
      return this.getLocalPrescriptions(userId);
    }

    try {
      const { data, error } = await supabase
        .from('prescriptions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('Error fetching prescriptions from Supabase:', error);
        return [];
      }

      if (!data || data.length === 0) {
        return [];
      }

      return data.map((row: any) => ({
        id: row.id,
        doctorName: row.doctor_name || '',
        doctorQualification: row.doctor_qualification || '',
        clinicName: row.clinic_name || '',
        patientName: row.patient_name || '',
        date: row.date || '',
        diagnosisSummary: row.diagnosis_summary || '',
        medicines: row.medicines || [],
        generalAdvice: row.general_advice || ''
      }));
    } catch (err) {
      console.warn('prescriptionService.getPrescriptions exception:', err);
      return this.getLocalPrescriptions(userId);
    }
  },

  /**
   * Saves a prescription record
   */
  async savePrescription(userId: string, rx: SyntheticPrescription, imageBlob?: Blob): Promise<SyntheticPrescription> {
    let remoteImageUrl: string | null = null;
    let imagePath: string | null = null;

    if (isSupabaseConfigured() && userId && imageBlob) {
      try {
        imagePath = `${userId}/rx_${Date.now()}.jpg`;
        const { error: uploadError } = await supabase.storage
          .from('prescriptions')
          .upload(imagePath, imageBlob, { upsert: true });

        if (!uploadError) {
          const { data: signed } = await supabase.storage
            .from('prescriptions')
            .createSignedUrl(imagePath, 3600);
          if (signed?.signedUrl) {
            remoteImageUrl = signed.signedUrl;
          }
        }
      } catch (uploadErr) {
        console.warn('Prescription image upload warning:', uploadErr);
      }
    }

    const localRx: SyntheticPrescription = {
      ...rx,
      id: rx.id || 'rx-' + Date.now()
    };

    if (!isSupabaseConfigured() || !userId) {
      if (userId) this.saveLocalPrescription(userId, localRx);
      return localRx;
    }

    try {
      const { data, error } = await supabase
        .from('prescriptions')
        .insert({
          user_id: userId,
          doctor_name: rx.doctorName,
          doctor_qualification: rx.doctorQualification,
          clinic_name: rx.clinicName,
          patient_name: rx.patientName,
          date: rx.date || new Date().toISOString().slice(0, 10),
          diagnosis_summary: rx.diagnosisSummary,
          general_advice: rx.generalAdvice,
          image_url: remoteImageUrl,
          image_path: imagePath,
          medicines: rx.medicines || []
        })
        .select()
        .single();

      if (error || !data) {
        console.warn('Error saving prescription to Supabase:', error);
        if (userId) this.saveLocalPrescription(userId, localRx);
        return localRx;
      }

      return {
        id: data.id,
        doctorName: data.doctor_name,
        doctorQualification: data.doctor_qualification,
        clinicName: data.clinic_name,
        patientName: data.patient_name,
        date: data.date,
        diagnosisSummary: data.diagnosis_summary,
        medicines: data.medicines || [],
        generalAdvice: data.general_advice
      };
    } catch (err) {
      console.warn('prescriptionService.savePrescription exception:', err);
      if (userId) this.saveLocalPrescription(userId, localRx);
      return localRx;
    }
  },

  /**
   * Deletes a prescription record
   */
  async deletePrescription(userId: string, prescriptionId: string): Promise<boolean> {
    if (!userId) return false;
    try {
      const list = this.getLocalPrescriptions(userId);
      const updated = list.filter((r) => r.id !== prescriptionId);
      localStorage.setItem(`healyaar_user_${userId}_prescriptions`, JSON.stringify(updated));
    } catch {}

    if (!isSupabaseConfigured()) return true;

    try {
      const { error } = await supabase
        .from('prescriptions')
        .delete()
        .eq('id', prescriptionId)
        .eq('user_id', userId);

      if (error) {
        console.warn('Error deleting prescription from Supabase:', error);
        return false;
      }
      return true;
    } catch (err) {
      console.warn('prescriptionService.deletePrescription exception:', err);
      return false;
    }
  },

  getLocalPrescriptions(userId: string): SyntheticPrescription[] {
    if (!userId) return [];
    try {
      const saved = localStorage.getItem(`healyaar_user_${userId}_prescriptions`);
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  },

  saveLocalPrescription(userId: string, rx: SyntheticPrescription): void {
    if (!userId) return;
    try {
      const existing = this.getLocalPrescriptions(userId);
      const updated = [rx, ...existing.filter((r) => r.id !== rx.id)];
      localStorage.setItem(`healyaar_user_${userId}_prescriptions`, JSON.stringify(updated));
    } catch {}
  }
};
