# GeoLife GPS ingestion

The backend accepts Microsoft GeoLife `.plt` trajectory files directly.

1. Download the dataset from Microsoft: https://www.microsoft.com/en-ie/download/details.aspx?id=52367
2. Extract the dataset.
3. Choose one `.plt` trajectory file from a user folder.
4. In the application select **GPS / Telemetry** and upload the `.plt` file.
5. The parser skips the six GeoLife header lines and creates timestamped latitude/longitude/altitude timeline events.

For a judge presentation, label the provenance as **Research dataset**. Do not represent the trajectory as belonging to the case suspect unless you have independent provenance establishing that relationship.
