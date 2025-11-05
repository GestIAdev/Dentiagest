// 🎸💀 GRAPHQL QUERIES - DOCUMENT MANAGER V2.0
/**
 * GraphQL Queries for Document Manager V2.0
 *
 * 🎯 MISSION: Provide unified document queries with V2.0 features
 * ✅ Unified document types
 * ✅ Legal categories
 * ✅ Smart tags
 * ✅ AI analysis results
 * ✅ Advanced filtering
 */

import { gql } from '@apollo/client';

// 🎯 SEARCH DOCUMENTS - V2.0 ADVANCED SEARCH
export const SEARCH_DOCUMENTS = gql`
  query SearchDocuments(
    $query: String!
    $filters: SearchFiltersInput
    $useAI: Boolean
    $limit: Int
    $offset: Int
  ) {
    searchDocuments(
      query: $query
      filters: $filters
      useAI: $useAI
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

        # SEARCH HIGHLIGHTS
        search_highlights
        relevance_score

        # RELATIONS
        patient {
          id
          first_name
          last_name
        }
      }
      total_count
      search_time_ms
      ai_suggestions
      facets {
        categories {
          name
          count
        }
        tags {
          name
          count
        }
        file_types {
          name
          count
        }
        date_ranges {
          range
          count
        }
      }
    }
  }
`;

// 🎯 GET UNIFIED DOCUMENTS - V3.0 MAIN QUERY WITH @veritas
export const GET_UNIFIED_DOCUMENTS = gql`
  query GetUnifiedDocuments(
    $patientId: String
    $category: String
    $searchTerm: String
    $tags: [String!]
    $dateFrom: DateTime
    $dateTo: DateTime
    $limit: Int
    $offset: Int
  ) {
    unifiedDocumentsV3(
      patientId: $patientId
      category: $category
      searchTerm: $searchTerm
      tags: $tags
      dateFrom: $dateFrom
      dateTo: $dateTo
      limit: $limit
      offset: $offset
    ) {
      id
      title
      title_veritas
      description
      description_veritas
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

      # V3.0 UNIFIED FIELDS WITH @veritas
      unified_type
      unified_type_veritas
      legal_category
      smart_tags
      compliance_status
      compliance_status_veritas

      # RELATIONS
      patient {
        id
        first_name
        last_name
      }
    }
  }
`;

// 🎯 GET DOCUMENT TYPES - V2.0 CONFIGURATION
export const GET_DOCUMENT_TYPES = gql`
  query GetDocumentTypes {
    documentTypes {
      id
      name
      label
      description
      category
      legal_category
      icon
      color
      is_active
    }
  }
`;

// 🎯 GET LEGAL CATEGORIES - V2.0 COMPLIANCE
export const GET_LEGAL_CATEGORIES = gql`
  query GetLegalCategories {
    legalCategories {
      id
      name
      label
      description
      gdpr_compliance
      retention_period_days
      color
      icon
      is_active
    }
  }
`;

// 🎯 GET SMART TAGS - V2.0 INTELLIGENCE
export const GET_SMART_TAGS = gql`
  query GetSmartTags($documentId: String) {
    smartTags(documentId: $documentId) {
      id
      name
      value
      confidence_score
      ai_generated
      created_at
      category
      color
    }
  }
`;

// 🎯 UPLOAD DOCUMENT MUTATION - V3.0 SMART UPLOAD WITH @veritas
export const UPLOAD_DOCUMENT_MUTATION = gql`
  mutation UploadDocument(
    $file: Upload!
    $patientId: String
    $title: String
    $description: String
    $category: String
  ) {
    uploadDocumentV3(
      file: $file
      patientId: $patientId
      title: $title
      description: $description
      category: $category
    ) {
      id
      title
      title_veritas
      description
      description_veritas
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

      # V3.0 UNIFIED FIELDS WITH @veritas
      unified_type
      unified_type_veritas
      legal_category
      smart_tags
      compliance_status
      compliance_status_veritas

      # RELATIONS
      patient {
        id
        first_name
        last_name
      }
    }
  }
`;

// 🎯 ANALYZE DOCUMENT WITH AI - V3.0 INTELLIGENCE WITH @veritas
export const ANALYZE_DOCUMENT_AI = gql`
  mutation AnalyzeDocumentAI($documentId: String!) {
    analyzeDocumentAIV3(documentId: $documentId) {
      id
      title
      title_veritas
      description
      description_veritas
      ai_analyzed
      ai_confidence_scores
      ocr_extracted_text
      ai_tags
      ai_analysis_results
      unified_type
      unified_type_veritas
      legal_category
      smart_tags
      compliance_status
      compliance_status_veritas
    }
  }
`;

// 🎯 UPDATE DOCUMENT TAGS - V3.0 MANAGEMENT WITH @veritas
export const UPDATE_DOCUMENT_TAGS = gql`
  mutation UpdateDocumentTags(
    $documentId: String!
    $tags: [String!]!
  ) {
    updateDocumentTagsV3(
      documentId: $documentId
      tags: $tags
    ) {
      id
      title
      title_veritas
      description
      description_veritas
      smart_tags
      ai_tags
      unified_type
      unified_type_veritas
      legal_category
      compliance_status
      compliance_status_veritas
    }
  }
`;

// 🎯 DELETE DOCUMENT - V3.0 MANAGEMENT WITH @veritas
export const DELETE_DOCUMENT = gql`
  mutation DeleteDocument($documentId: String!) {
    deleteDocumentV3(documentId: $documentId) {
      id
      title
      title_veritas
      description
      description_veritas
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

      # V3.0 UNIFIED FIELDS WITH @veritas
      unified_type
      unified_type_veritas
      legal_category
      smart_tags
      compliance_status
      compliance_status_veritas

      # RELATIONS
      patient {
        id
        first_name
        last_name
      }
    }
  }
`;

// 🎯 BULK OPERATIONS - V3.0 ENTERPRISE WITH @veritas
export const BULK_UPDATE_DOCUMENTS = gql`
  mutation BulkUpdateDocuments(
    $documentIds: [String!]!
    $operation: String!
    $data: JSON
  ) {
    bulkUpdateDocumentsV3(
      documentIds: $documentIds
      operation: $operation
      data: $data
    ) {
      success
      message
      affected_count
      updated_documents {
        id
        title
        title_veritas
        description
        description_veritas
        unified_type
        unified_type_veritas
        legal_category
        smart_tags
        compliance_status
        compliance_status_veritas
      }
    }
  }
`;

// 🎯 CREATE TAG - V2.0 TAG MANAGEMENT
export const CREATE_TAG = gql`
  mutation CreateTag(
    $name: String!
    $category: String!
    $color: String!
    $description: String
  ) {
    createTag(
      name: $name
      category: $category
      color: $color
      description: $description
    ) {
      id
      name
      value
      confidence_score
      ai_generated
      created_at
      category
      color
      usage_count
      description
    }
  }
`;

// 🎯 UPDATE TAG - V2.0 TAG MANAGEMENT
export const UPDATE_TAG = gql`
  mutation UpdateTag(
    $id: String!
    $name: String!
    $category: String!
    $color: String!
    $description: String
  ) {
    updateTag(
      id: $id
      name: $name
      category: $category
      color: $color
      description: $description
    ) {
      id
      name
      value
      confidence_score
      ai_generated
      created_at
      category
      color
      usage_count
      description
    }
  }
`;

// 🎯 DELETE TAG - V2.0 TAG MANAGEMENT
export const DELETE_TAG = gql`
  mutation DeleteTag($id: String!) {
    deleteTag(id: $id) {
      success
      message
    }
  }
`;

// 🎯 DOCUMENT ANALYTICS - V2.0 INSIGHTS
export const GET_DOCUMENT_ANALYTICS = gql`
  query GetDocumentAnalytics(
    $patientId: String
    $dateFrom: DateTime
    $dateTo: DateTime
  ) {
    documentAnalytics(
      patientId: $patientId
      dateFrom: $dateFrom
      dateTo: $dateTo
    ) {
      total_documents
      documents_by_type {
        type
        count
        percentage
      }
      documents_by_category {
        category
        count
        percentage
      }
      ai_analyzed_percentage
      storage_used_mb
      recent_uploads
      compliance_status
    }
  }
`;

// 🎯 SYSTEM STATUS - V2.0 MONITORING
export const GET_SYSTEM_STATUS = gql`
  query GetSystemStatus {
    systemStatus {
      version
      document_count
      ai_service_status
      storage_status
      last_backup
      uptime_percentage
    }
  }
`;

// 🎯🎸💀 AI SERVICES QUERIES - V2.0 CYBERPUNK REVOLUTION
/**
 * AI Services Integration - Advanced AI Capabilities
 *
 * 🎯 MISSION: Provide comprehensive AI service integration
 * ✅ AI configuration management
 * ✅ Advanced AI analysis queries
 * ✅ AI-powered search and filtering
 * ✅ AI analytics and insights
 * ✅ Real-time AI processing status
 */

// 🎯 GET AI CONFIGURATION - USER PREFERENCES
export const GET_AI_CONFIGURATION = gql`
  query GetAIConfiguration($userId: String) {
    aiConfiguration(userId: $userId) {
      enabled
      autoAnalysis
      confidenceThreshold
      preferredModel
      maxTokens
      features {
        tagSuggestion
        anomalyDetection
        contentSummary
        medicalTermExtraction
        complianceCheck
        riskAssessment
      }
      privacy {
        storeAnalysisResults
        shareWithTeam
        anonymizeData
        dataRetentionDays
      }
      performance {
        batchProcessing
        backgroundAnalysis
        cacheResults
        maxConcurrentRequests
      }
      notifications {
        analysisComplete
        lowConfidenceAlert
        anomalyDetected
        complianceIssue
      }
      updatedAt
    }
  }
`;

// 🎯 UPDATE AI CONFIGURATION - USER PREFERENCES
export const UPDATE_AI_CONFIGURATION = gql`
  mutation UpdateAIConfiguration(
    $userId: String!
    $configuration: AIConfigurationInput!
  ) {
    updateAIConfiguration(
      userId: $userId
      configuration: $configuration
    ) {
      success
      message
      configuration {
        enabled
        autoAnalysis
        confidenceThreshold
        preferredModel
        maxTokens
        features {
          tagSuggestion
          anomalyDetection
          contentSummary
          medicalTermExtraction
          complianceCheck
          riskAssessment
        }
        privacy {
          storeAnalysisResults
          shareWithTeam
          anonymizeData
          dataRetentionDays
        }
        performance {
          batchProcessing
          backgroundAnalysis
          cacheResults
          maxConcurrentRequests
        }
        notifications {
          analysisComplete
          lowConfidenceAlert
          anomalyDetected
          complianceIssue
        }
        updatedAt
      }
    }
  }
`;

// 🎯 ADVANCED AI ANALYSIS - DETAILED RESULTS
export const GET_AI_ANALYSIS_RESULTS = gql`
  query GetAIAnalysisResults(
    $documentId: String!
    $includeRawData: Boolean
  ) {
    aiAnalysisResults(
      documentId: $documentId
      includeRawData: $includeRawData
    ) {
      documentId
      analysisType
      confidence
      processingTime
      aiModel
      timestamp

      # DETAILED RESULTS
      detectedAnomalies {
        type
        severity
        description
        location
        confidence
      }
      suggestedTags {
        name
        confidence
        category
        source
      }
      medicalTerms {
        term
        category
        confidence
        context
      }
      contentSummary {
        summary
        keyPoints
        language
        sentiment
      }
      riskAssessment {
        level
        factors
        mitigationSteps
        recommendations
      }
      complianceStatus {
        gdpr
        hipaa
        localRegulations
        issues {
          type
          description
          severity
          recommendation
        }
      }

      # RAW DATA (optional)
      rawAnalysisData
      processingMetadata
    }
  }
`;

// 🎯 AI-POWERED SEARCH - ADVANCED FILTERING
export const AI_POWERED_SEARCH = gql`
  query AIPoweredSearch(
    $query: String!
    $aiFilters: AIFiltersInput
    $searchOptions: SearchOptionsInput
    $limit: Int
    $offset: Int
  ) {
    aiPoweredSearch(
      query: $query
      aiFilters: $aiFilters
      searchOptions: $searchOptions
      limit: $limit
      offset: $offset
    ) {
      documents {
        id
        title
        description
        file_name
        ai_analyzed
        ai_confidence_scores
        ai_tags
        ai_analysis_results
        unified_type
        legal_category
        smart_tags
        compliance_status
        relevance_score
        ai_search_highlights
        patient {
          id
          first_name
          last_name
        }
      }
      total_count
      search_time_ms
      ai_processing_time_ms
      ai_suggestions {
        type
        suggestion
        confidence
        reason
      }
      ai_insights {
        insight_type
        title
        description
        confidence
        related_documents
      }
      facets {
        ai_tags {
          name
          count
          confidence_avg
        }
        confidence_ranges {
          range
          count
        }
        anomaly_types {
          type
          count
          severity_avg
        }
        medical_categories {
          category
          count
        }
      }
    }
  }
`;

// 🎯 BATCH AI ANALYSIS - MULTIPLE DOCUMENTS
export const BATCH_AI_ANALYSIS = gql`
  mutation BatchAIAnalysis(
    $documentIds: [String!]!
    $analysisTypes: [String!]
    $priority: String
  ) {
    batchAIAnalysis(
      documentIds: $documentIds
      analysisTypes: $analysisTypes
      priority: $priority
    ) {
      jobId
      status
      estimatedCompletionTime
      documentsProcessed
      documentsTotal
      results {
        documentId
        status
        confidence
        processingTime
        error
      }
    }
  }
`;

// 🎯 AI ANALYSIS STATUS - REAL-TIME MONITORING
export const GET_AI_ANALYSIS_STATUS = gql`
  query GetAIAnalysisStatus($jobId: String) {
    aiAnalysisStatus(jobId: $jobId) {
      jobId
      status
      progress
      documentsProcessed
      documentsTotal
      estimatedTimeRemaining
      currentDocument
      errors
      results {
        documentId
        status
        confidence
        processingTime
        error
      }
      startedAt
      completedAt
    }
  }
`;

// 🎯 AI ANALYTICS - INSIGHTS AND METRICS
export const GET_AI_ANALYTICS = gql`
  query GetAIAnalytics(
    $dateFrom: DateTime
    $dateTo: DateTime
    $userId: String
  ) {
    aiAnalytics(
      dateFrom: $dateFrom
      dateTo: $dateTo
      userId: $userId
    ) {
      total_analyses
      average_confidence
      analysis_success_rate
      processing_time_avg
      most_used_models
      top_ai_tags
      anomaly_detection_rate
      compliance_check_rate
      documents_by_confidence_range {
        range
        count
        percentage
      }
      analyses_by_type {
        type
        count
        success_rate
        avg_confidence
      }
      ai_service_uptime
      cost_savings_estimate
      time_savings_estimate
      user_satisfaction_score
    }
  }
`;

// 🎯 AI SUGGESTIONS - SMART RECOMMENDATIONS
export const GET_AI_SUGGESTIONS = gql`
  query GetAISuggestions(
    $context: String!
    $documentId: String
    $userId: String
  ) {
    aiSuggestions(
      context: $context
      documentId: $documentId
      userId: $userId
    ) {
      suggestions {
        id
        type
        title
        description
        confidence
        action_type
        action_data
        reason
        category
      }
      context_analysis
      user_preferences
      system_recommendations
    }
  }
`;

// 🎯 TRAIN AI MODEL - CUSTOMIZATION
export const TRAIN_AI_MODEL = gql`
  mutation TrainAIModel(
    $modelType: String!
    $trainingData: TrainingDataInput!
    $parameters: ModelParametersInput
  ) {
    trainAIModel(
      modelType: $modelType
      trainingData: $trainingData
      parameters: $parameters
    ) {
      modelId
      status
      training_progress
      estimated_completion_time
      validation_results
      model_metrics
    }
  }
`;

// 🎯 AI MODEL MANAGEMENT - ADMIN FEATURES
export const GET_AI_MODELS = gql`
  query GetAIModels($status: String) {
    aiModels(status: $status) {
      id
      name
      type
      version
      status
      accuracy
      training_date
      last_used
      usage_count
      performance_metrics
      configuration
    }
  }
`;

// 🎯 EXPORT AI RESULTS - DATA PORTABILITY
export const EXPORT_AI_RESULTS = gql`
  mutation ExportAIResults(
    $documentIds: [String!]
    $format: String!
    $includeRawData: Boolean
    $dateRange: DateRangeInput
  ) {
    exportAIResults(
      documentIds: $documentIds
      format: $format
      includeRawData: $includeRawData
      dateRange: $dateRange
    ) {
      exportId
      status
      downloadUrl
      fileSize
      recordCount
      estimatedCompletionTime
    }
  }
`;

// 🎯 AI SERVICE HEALTH CHECK
export const GET_AI_SERVICE_HEALTH = gql`
  query GetAIServiceHealth {
    aiServiceHealth {
      service_name
      status
      response_time_ms
      last_check
      uptime_percentage
      error_rate
      queue_length
      active_jobs
      version
      capabilities
    }
  }
`;
