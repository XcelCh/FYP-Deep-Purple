package com.example.fyp.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import lombok.Data;

@Data
@Entity
public class Transcript {
    @Id
    @ManyToOne
    @JoinColumn(name = "recording_id")
    private RecordingAnalysis recordingAnalysis;

    @Id
    private Integer transcriptId;

    private String startTime;
    private String endTime;

    @Column(columnDefinition = "TEXT")
    private String dialog;
    
}
