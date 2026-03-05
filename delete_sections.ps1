Remove-Item -Recurse -Force "src\app\(admin)\analytics"
Remove-Item -Recurse -Force "src\app\(admin)\salary"
if (Test-Path "src\hooks\useSalaryManagement.ts") {
    Remove-Item -Force "src\hooks\useSalaryManagement.ts"
}
Write-Host "Done."
