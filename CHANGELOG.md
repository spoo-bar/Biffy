# Change Log

All notable changes to the "Biffy" extension will be documented in this file.

Check [Keep a Changelog](http://keepachangelog.com/) for recommendations on how to structure this file.

## 1.7.0

### Added

* Mapping for beml files will map all the bxml files which refer it.
* Setting to ignore collaboration folder when finding references and mapping.
* Setting to map beml files recursively.

## 1.6.1

### Added

* Icon in title menu and option in context menu to map a bxml file

### Changed

* Option to map a file only appears in a bxml file.

## 1.6.0

### Added

* Command to open a mapped file based on the GUID

## 1.5.2

### Changed

* Running mapping on a bxml page, now saves and updates the corresponding content in the BIF-Source/mapped folder.

## 1.5.1

### Changed

* Showing mapping status and error
* Generate GUIDs with keyboard shortcut `Ctrl + Alt + G`

## 1.5

### Changed

* Support for Find All References and Go to Definition for non GUID texts
* Adding docs for key bindings

## 1.4.1

### Changed

* New configuration setting `conf.biffy.mappedViewColumn` added to select where the mapped view should be opened.

## 1.4.0

### Added

* Added command(`Ctrl + M`) to dynamically generate and fetch mapped file for current bif view

## 1.3.0

### Added

* Support for Format Document and Format selection for .beml and .bxml files

## 1.2.0

### Added

* Support for Go to Definition and Peek Definition for BIF GUIDs (except Localization GUIDs)

## 1.1.0

### Added

* Support for Find All References and Peek References for BIF GUIDs (except Localization GUIDs)
* Extension configuration to store BIF Source path
