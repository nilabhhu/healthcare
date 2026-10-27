import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { AnalyzedReportRecord } from '../views/ReportsView';

export const medicalReportService = {
  /**
   * Fetches user's saved medical report history
   */
  async getReports(userId: string): Promise<AnalyzedReportRecord[]> {
    if (!userId) {
      return [];
    }

    if (!isSupabaseConfigured()) {
      return this.getLocalReports(userId);
    }

    try {
      const { data, error } = await supabase
        .from('medical_reports')
        .select('*')
        .eq('user_id', userId)
        .order('upload_date', { ascending: false });

      if (error) {
        console.warn('Error fetching medical reports from Supabase:', error);
        return [];
      }

      if (!data || data.length === 0) {
        return [];
      }

      return data.map((row: any) => ({
        id: row.id,
        title: row.title,
        fileName: row.file_name,
        fileSizeFormatted: row.file_size_formatted || undefined,
        fileDataUrl: row.file_url || undefined,
        uploadDate: row.upload_date,
        isDemo: row.is_demo ?? false,
        summary: row.summary,
        keyFindings: row.key_findings || [],
        metrics: row.metrics || [],
        thingsToDiscuss: row.things_to_discuss || [],
        disclaimer: row.disclaimer || ''
      }));
    } catch (err) {
      console.warn('medicalReportService.getReports exception:', err);
      return this.getLocalReports(userId);
    }
  },

  /**
   * Saves an analyzed medical report
   */
  async saveReport(userId: string, report: AnalyzedReportRecord, fileBlob?: Blob): Promise<AnalyzedReportRecord> {
    let remoteFileUrl = report.fileDataUrl;
    let filePath: string | null = null;

    if (isSupabaseConfigured() && userId && fileBlob) {
      try {
        const cleanName = report.fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
        filePath = `${userId}/${Date.now()}_${cleanName}`;

        const { error: uploadError } = await supabase.storage
          .from('medical-reports')
          .upload(filePath, fileBlob, { upsert: true });

        if (!uploadError) {
          // Create signed URL valid for 1 hour (strictly private)
          const { data: signed } = await supabase.storage
            .from('medical-reports')
            .createSignedUrl(filePath, 3600);
          if (signed?.signedUrl) {
            remoteFileUrl = signed.signedUrl;
          }
        }
      } catch (uploadErr) {
        console.warn('Report file upload warning:', uploadErr);
      }
    }

    const reportRecord: AnalyzedReportRecord = {
      ...report,
      fileDataUrl: remoteFileUrl
    };

    if (!isSupabaseConfigured() || !userId) {
      if (userId) this.saveLocalReport(userId, reportRecord);
      return reportRecord;
    }

    try {
      const { data, error } = await supabase
        .from('medical_reports')
        .insert({
          user_id: userId,
          title: report.title,
          file_name: report.fileName,
          file_size_formatted: report.fileSizeFormatted,
          file_url: remoteFileUrl,
          file_path: filePath,
          is_demo: report.isDemo,
          summary: report.summary,
          key_findings: report.keyFindings,
          metrics: report.metrics || [],
          things_to_discuss: report.thingsToDiscuss,
          disclaimer: report.disclaimer,
          upload_date: report.uploadDate
        })
        .select()
        .single();

      if (error || !data) {
        console.warn('Error saving report to Supabase:', error);
        if (userId) this.saveLocalReport(userId, reportRecord);
        return reportRecord;
      }

      return {
        id: data.id,
        title: data.title,
        fileName: data.file_name,
        fileSizeFormatted: data.file_size_formatted || undefined,
        fileDataUrl: data.file_url || undefined,
        uploadDate: data.upload_date,
        isDemo: data.is_demo,
        summary: data.summary,
        keyFindings: data.key_findings || [],
        metrics: data.metrics || [],
        thingsToDiscuss: data.things_to_discuss || [],
        disclaimer: data.disclaimer || ''
      };
    } catch (err) {
      console.warn('medicalReportService.saveReport exception:', err);
      if (userId) this.saveLocalReport(userId, reportRecord);
      return reportRecord;
    }
  },

  /**
   * Deletes a medical report
   */
  async deleteReport(userId: string, reportId: string): Promise<boolean> {
    if (!userId) return false;
    try {
      const list = this.getLocalReports(userId);
      const updated = list.filter((r) => r.id !== reportId);
      localStorage.setItem(`healyaar_user_${userId}_reports`, JSON.stringify(updated));
    } catch {}

    if (!isSupabaseConfigured()) return true;

    try {
      const { error } = await supabase
        .from('medical_reports')
        .delete()
        .eq('id', reportId)
        .eq('user_id', userId);

      if (error) {
        console.warn('Error deleting report from Supabase:', error);
        return false;
      }
      return true;
    } catch (err) {
      console.warn('medicalReportService.deleteReport exception:', err);
      return false;
    }
  },

  getLocalReports(userId: string): AnalyzedReportRecord[] {
    if (!userId) return [];
    try {
      const saved = localStorage.getItem(`healyaar_user_${userId}_reports`);
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  },

  saveLocalReport(userId: string, report: AnalyzedReportRecord): void {
    if (!userId) return;
    try {
      const existing = this.getLocalReports(userId);
      const updated = [report, ...existing.filter((r) => r.id !== report.id)];
      localStorage.setItem(`healyaar_user_${userId}_reports`, JSON.stringify(updated));
    } catch {}
  }
};
