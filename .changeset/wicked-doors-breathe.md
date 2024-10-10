---
"@comet/brevo-api": patch
---

Support multiselect values in contact import

Previously the contact import did not support multiselect values since brevo expects an array of values and the csv import only sent values as strings. Now the import value gets transformed to an array in case the contact attribute should be of type array. The value in the csv file's column needs to be separated with a comma in case of multiple selected values.
