// 🎸💀 TIMELINE GRAPHQL QUERIES - PHASE 6 ENTERPRISE
/**
 * Timeline-specific GraphQL Queries for Phase 6 Enterprise Features
 *
 * 🎯 MISSION: Provide comprehensive timeline data with enterprise features
 * ✅ Chronological document loading
 * ✅ Timeline position management
 * ✅ Advanced filtering and clustering
 * ✅ Real-time updates and analytics
 * ✅ Enterprise compliance and audit trails
 */

import { gql } from '@apollo/client';

// 🎯 GET TIMELINE DOCUMENTS - MAIN TIMELINE QUERY
export const GET_TIMELINE_DOCUMENTS = gql`
  query GetTimelineDocuments(
    $patientId: String
    $isGlobalMode: Boolean
    $timeScale: String
    $currentDate: DateTime
    $filterTags: [String!]
    $filterCategories: [String!]
    $searchQuery: String
    $limit: Int
    $offset: Int
  ) {
    timelineDocuments(
      patientId: $patientId
      isGlobalMode: $isGlobalMode
      timeScale: $timeScale
      currentDate: $currentDate
      filterTags: $filterTags
      filterCategories: $filterCategories
      searchQuery: $searchQuery
      limit: $limit
      offset: $offset
    ) {
      documents {
        id
        title
        description
        file_name
        file_size_mb
        mime_type
        is_image
        is_xray
        ai_analyzed
        ai_confidence_scores
        ocr_extracted_text
        ai_tags
        ai_analysis_results
        download_url
        thumbnail_url
        created_at
        document_date

        # V2.0 UNIFIED FIELDS
        unified_type
        legal_category
        smart_tags
        compliance_status

        # TIMELINE POSITION
        timeline_position {
          x
          y
          lane
        }

        # RELATIONS
        patient {
          id
          first_name
          last_name
        }
      }
      total_count
      has_more
      next_offset
      clustering_info {
        clusters {
          id
          label
          document_count
          date_range
          category
          color
          position
        }
        smart_groups {
          id
          name
          criteria
          documents
          insights
        }
      }
    }
  }
`;

// 🎯 UPDATE TIMELINE POSITION - DRAG & DROP
export const UPDATE_TIMELINE_POSITION = gql`
  mutation UpdateTimelinePosition(
    $documentId: String!
    $position: TimelinePositionInput!
  ) {
    updateTimelinePosition(
      documentId: $documentId
      position: $position
    ) {
      success
      message
      document {
        id
        timeline_position {
          x
          y
          lane
        }
      }
      audit_entry {
        id
        action
        timestamp
        user_id
        details
      }
    }
  }
`;

// 🎯 BULK UPDATE TIMELINE POSITIONS - ENTERPRISE FEATURE
export const BULK_UPDATE_TIMELINE_POSITIONS = gql`
  mutation BulkUpdateTimelinePositions(
    $updates: [TimelinePositionUpdateInput!]!
  ) {
    bulkUpdateTimelinePositions(updates: $updates) {
      success
      message
      updated_count
      failed_count
      results {
        document_id
        success
        error
      }
      audit_entries {
        id
        action
        timestamp
        user_id
        details
      }
    }
  }
`;

// 🎯 GET TIMELINE ANALYTICS - ENTERPRISE INSIGHTS
export const GET_TIMELINE_ANALYTICS = gql`
  query GetTimelineAnalytics(
    $patientId: String
    $dateFrom: DateTime
    $dateTo: DateTime
    $timeScale: String
  ) {
    timelineAnalytics(
      patientId: $patientId
      dateFrom: $dateFrom
      dateTo: $dateTo
      timeScale: $timeScale
    ) {
      total_documents
      documents_by_lane
      documents_by_category
      timeline_density
      clustering_efficiency
      user_interactions
      average_session_time
      most_active_periods
      predictive_insights {
        next_upload_prediction
        category_trends
        anomaly_alerts
        compliance_risks
      }
      performance_metrics {
        load_time_ms
        render_time_ms
        interaction_response_ms
        data_transfer_mb
      }
    }
  }
`;

// 🎯 CREATE TIMELINE CLUSTER - SMART ORGANIZATION
export const CREATE_TIMELINE_CLUSTER = gql`
  mutation CreateTimelineCluster(
    $name: String!
    $criteria: ClusterCriteriaInput!
    $documents: [String!]!
    $color: String
  ) {
    createTimelineCluster(
      name: $name
      criteria: $criteria
      documents: $documents
      color: $color
    ) {
      success
      message
      cluster {
        id
        name
        criteria
        documents
        color
        created_at
        created_by
      }
    }
  }
`;

// 🎯 GET TIMELINE CLUSTERS - ORGANIZATION MANAGEMENT
export const GET_TIMELINE_CLUSTERS = gql`
  query GetTimelineClusters($patientId: String) {
    timelineClusters(patientId: $patientId) {
      id
      name
      criteria
      documents
      color
      created_at
      created_by
      last_modified
      usage_count
      ai_generated
    }
  }
`;

// 🎯 TIMELINE EXPORT - ENTERPRISE FEATURE
export const EXPORT_TIMELINE = gql`
  mutation ExportTimeline(
    $patientId: String
    $format: String!
    $includeAnalytics: Boolean
    $includeClusters: Boolean
    $dateRange: DateRangeInput
  ) {
    exportTimeline(
      patientId: $patientId
      format: $format
      includeAnalytics: $includeAnalytics
      includeClusters: $includeClusters
      dateRange: $dateRange
    ) {
      success
      message
      export_id
      download_url
      file_size_mb
      record_count
      estimated_completion_time
    }
  }
`;

// 🎯 TIMELINE NOTIFICATIONS - REAL-TIME UPDATES
export const GET_TIMELINE_NOTIFICATIONS = gql`
  query GetTimelineNotifications(
    $userId: String!
    $limit: Int
  ) {
    timelineNotifications(
      userId: $userId
      limit: $limit
    ) {
      id
      type
      title
      message
      severity
      timestamp
      read
      action_url
      metadata
    }
  }
`;

// 🎯 MARK NOTIFICATION READ - USER INTERACTION
export const MARK_NOTIFICATION_READ = gql`
  mutation MarkNotificationRead($notificationId: String!) {
    markNotificationRead(notificationId: $notificationId) {
      success
      notification {
        id
        read
        read_at
      }
    }
  }
`;

// 🎯 TIMELINE AUDIT TRAIL - ENTERPRISE COMPLIANCE
export const GET_TIMELINE_AUDIT_TRAIL = gql`
  query GetTimelineAuditTrail(
    $patientId: String
    $userId: String
    $dateFrom: DateTime
    $dateTo: DateTime
    $limit: Int
    $offset: Int
  ) {
    timelineAuditTrail(
      patientId: $patientId
      userId: $userId
      dateFrom: $dateFrom
      dateTo: $dateTo
      limit: $limit
      offset: $offset
    ) {
      entries {
        id
        action
        timestamp
        user_id
        user_name
        patient_id
        document_id
        details
        ip_address
        user_agent
        compliance_status
      }
      total_count
      has_more
    }
  }
`;

// 🎯 TIMELINE PREDICTIVE ANALYTICS - AI INSIGHTS
export const GET_TIMELINE_PREDICTIONS = gql`
  query GetTimelinePredictions(
    $patientId: String
    $timeframe: String
  ) {
    timelinePredictions(
      patientId: $patientId
      timeframe: $timeframe
    ) {
      document_type_predictions {
        type
        probability
        expected_count
        confidence
      }
      upload_pattern_predictions {
        pattern
        frequency
        next_expected_date
        confidence
      }
      risk_predictions {
        risk_type
        probability
        severity
        mitigation_suggestions
        confidence
      }
      compliance_predictions {
        issue_type
        probability
        deadline
        recommended_actions
        confidence
      }
      generated_at
      model_version
    }
  }
`;

// 🎯 TIMELINE REAL-TIME SUBSCRIPTION - LIVE UPDATES
export const TIMELINE_UPDATES_SUBSCRIPTION = gql`
  subscription TimelineUpdates($patientId: String) {
    timelineUpdates(patientId: $patientId) {
      update_type
      document_id
      document {
        id
        title
        unified_type
        legal_category
        created_at
        timeline_position {
          x
          y
          lane
        }
      }
      user_id
      timestamp
      metadata
    }
  }
`;

// 🎯 TIMELINE SEARCH SUGGESTIONS - AI-POWERED
export const GET_TIMELINE_SEARCH_SUGGESTIONS = gql`
  query GetTimelineSearchSuggestions(
    $query: String!
    $patientId: String
    $limit: Int
  ) {
    timelineSearchSuggestions(
      query: $query
      patientId: $patientId
      limit: $limit
    ) {
      suggestions {
        text
        type
        relevance_score
        document_count
        category
      }
      related_tags
      related_categories
      ai_insights
    }
  }
`;

// 🎯 TIMELINE PERFORMANCE METRICS - MONITORING
export const GET_TIMELINE_PERFORMANCE = gql`
  query GetTimelinePerformance(
    $dateFrom: DateTime
    $dateTo: DateTime
  ) {
    timelinePerformance(
      dateFrom: $dateFrom
      dateTo: $dateTo
    ) {
      average_load_time
      average_render_time
      cache_hit_rate
      error_rate
      user_satisfaction_score
      feature_usage {
        feature
        usage_count
        average_time_spent
      }
      performance_trends {
        date
        load_time
        render_time
        error_count
      }
    }
  }
`;

// 🎯 TIMELINE BACKUP & RECOVERY - ENTERPRISE FEATURE
export const CREATE_TIMELINE_BACKUP = gql`
  mutation CreateTimelineBackup(
    $patientId: String
    $includeDocuments: Boolean
    $includeAnalytics: Boolean
  ) {
    createTimelineBackup(
      patientId: $patientId
      includeDocuments: $includeDocuments
      includeAnalytics: $includeAnalytics
    ) {
      success
      message
      backup_id
      backup_url
      file_size_mb
      created_at
      expires_at
    }
  }
`;

// 🎯 RESTORE TIMELINE FROM BACKUP - ENTERPRISE FEATURE
export const RESTORE_TIMELINE_BACKUP = gql`
  mutation RestoreTimelineBackup(
    $backupId: String!
    $patientId: String
  ) {
    restoreTimelineBackup(
      backupId: $backupId
      patientId: $patientId
    ) {
      success
      message
      restored_documents_count
      restored_clusters_count
      audit_entries_created
    }
  }
`;
