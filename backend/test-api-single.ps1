$base = 'http://localhost:10000/api'

$login = Invoke-RestMethod -Uri "$base/auth/login" -Method Post -Body (@{username='admin'; password='kantin123'} | ConvertTo-Json) -ContentType 'application/json'
$token = $login.token
Write-Host "TOKEN: $token"

$prod = Invoke-RestMethod -Uri "$base/urunler" -Headers @{ Authorization = "Bearer $token" }
$existingProduct = $null
foreach ($prop in $prod.PSObject.Properties) {
    foreach ($item in $prop.Value) {
        if ($item.stock -gt 0) {
            $existingProduct = $item
            break
        }
    }
    if ($existingProduct) { break }
}
if (-not $existingProduct) { throw 'Stoklu ürün bulunamadı' }
Write-Host "EXISTING PRODUCT: $($existingProduct.id) $($existingProduct.name) $($existingProduct.price) $($existingProduct.stock)"

$personName = 'TestKisiSingle' + (Get-Date -UFormat %s)
$newPerson = Invoke-RestMethod -Uri "$base/kisiler" -Method Post -Headers @{ Authorization = "Bearer $token" } -Body (@{ name = $personName } | ConvertTo-Json) -ContentType 'application/json'
Write-Host "NEW PERSON: $($newPerson.id) $($newPerson.name) $($newPerson.balance)"

$updatedPerson = Invoke-RestMethod -Uri "$base/kisiler/$($newPerson.id)/balance" -Method Patch -Headers @{ Authorization = "Bearer $token" } -Body (@{ amount = 50 } | ConvertTo-Json) -ContentType 'application/json'
Write-Host "UPDATED BALANCE: $($updatedPerson.balance)"

$sale = Invoke-RestMethod -Uri "$base/islemler" -Method Post -Headers @{ Authorization = "Bearer $token" } -Body (@{ personId = $newPerson.id; paid = $false; items = @(@{ productId = $existingProduct.id; quantity = 1 }) } | ConvertTo-Json) -ContentType 'application/json'
if ($sale -is [System.Array]) { $saleId = $sale[0].id } else { $saleId = $sale.id }
Write-Host "SALE RESPONSE: $($sale | ConvertTo-Json -Compress)"

$peopleAfterSale = @(Invoke-RestMethod -Uri "$base/kisiler" -Headers @{ Authorization = "Bearer $token" })
$personAfterSale = $peopleAfterSale | Where-Object { $_.name -eq $personName }
Write-Host "BALANCE AFTER SALE: $($personAfterSale.balance)"

$productAfter = Invoke-RestMethod -Uri "$base/urunler" -Headers @{ Authorization = "Bearer $token" }
$updatedProduct = $null
foreach ($prop in $productAfter.PSObject.Properties) {
    foreach ($item in $prop.Value) {
        if ($item.id -eq $existingProduct.id) {
            $updatedProduct = $item
            break
        }
    }
    if ($updatedProduct) { break }
}
Write-Host "STOCK AFTER SALE: $($updatedProduct.stock)"

$toggle = Invoke-RestMethod -Uri "$base/islemler/$saleId/payment" -Method Patch -Headers @{ Authorization = "Bearer $token" } -Body (@{ paid = $false } | ConvertTo-Json) -ContentType 'application/json'
Write-Host "PAYMENT TOGGLED PAID: $($toggle.paid)"

$peopleAfterCancel = @(Invoke-RestMethod -Uri "$base/kisiler" -Headers @{ Authorization = "Bearer $token" })
$finalPerson = $peopleAfterCancel | Where-Object { $_.name -eq $personName }
Write-Host "BALANCE AFTER CANCELLATION: $($finalPerson.balance)"
