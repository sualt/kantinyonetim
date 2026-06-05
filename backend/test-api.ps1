$base = 'http://localhost:10000/api'

$login = Invoke-RestMethod -Uri "$base/auth/login" -Method Post -Body (@{username='admin'; password='kantin123'} | ConvertTo-Json) -ContentType 'application/json'
$token = $login.token
Write-Host "TOKEN: $token"

$prod = Invoke-RestMethod -Uri "$base/urunler" -Headers @{ Authorization = "Bearer $token" }
Write-Host "PRODUCT CATEGORIES: $($prod.PSObject.Properties.Name -join ', ')"

$newProductName = 'Test Ürün ' + (Get-Date -UFormat %s)
$newProduct = Invoke-RestMethod -Uri "$base/urunler" -Method Post -Headers @{ Authorization = "Bearer $token" } -Body (@{ category = 'Test'; name = $newProductName; price = 8; stock = 10 } | ConvertTo-Json) -ContentType 'application/json'
Write-Host "NEW PRODUCT: $($newProduct.id) $($newProduct.name) $($newProduct.stock)"

$personName = 'TestKisi' + (Get-Date -UFormat %s)
$newPerson = Invoke-RestMethod -Uri "$base/kisiler" -Method Post -Headers @{ Authorization = "Bearer $token" } -Body (@{ name = $personName } | ConvertTo-Json) -ContentType 'application/json'
Write-Host "NEW PERSON: $($newPerson.id) $($newPerson.name) $($newPerson.balance)"

$updatedPerson = Invoke-RestMethod -Uri "$base/kisiler/$($newPerson.id)/balance" -Method Patch -Headers @{ Authorization = "Bearer $token" } -Body (@{ amount = 100 } | ConvertTo-Json) -ContentType 'application/json'
Write-Host "UPDATED BALANCE: $($updatedPerson.balance)"

$existingProduct = $null
foreach ($prop in $prod.PSObject.Properties) {
    foreach ($item in $prop.Value) {
        if ($item.stock -gt 0 -and $item.name -ne $newProductName) {
            $existingProduct = $item
            break
        }
    }
    if ($existingProduct) { break }
}
if (-not $existingProduct) { throw 'Stoklu ürün bulunamadı' }
Write-Host "EXISTING PRODUCT: $($existingProduct.id) $($existingProduct.name) $($existingProduct.price) $($existingProduct.stock)"

$sale = Invoke-RestMethod -Uri "$base/islemler" -Method Post -Headers @{ Authorization = "Bearer $token" } -Body (@{ personId = $newPerson.id; paid = $false; items = @(@{ productId = $newProduct.id; quantity = 2 }, @{ productId = $existingProduct.id; quantity = 1 }) } | ConvertTo-Json) -ContentType 'application/json'
if ($sale -is [System.Array]) { $saleId = $sale[0].id } else { $saleId = $sale.id }
Write-Host "SALE RESPONSE: $($sale | ConvertTo-Json -Compress)"

$sales = Invoke-RestMethod -Uri "$base/islemler?personId=$($newPerson.id)" -Headers @{ Authorization = "Bearer $token" }
Write-Host "SALES COUNT: $($sales.Count)"

$productAfter = Invoke-RestMethod -Uri "$base/urunler" -Headers @{ Authorization = "Bearer $token" }
$updatedNewProduct = $null
foreach ($prop in $productAfter.PSObject.Properties) {
    foreach ($item in $prop.Value) {
        if ($item.id -eq $newProduct.id) {
            $updatedNewProduct = $item
            break
        }
    }
    if ($updatedNewProduct) { break }
}
Write-Host "PRODUCT STOCK AFTER: $($updatedNewProduct.stock)"

$toggle = Invoke-RestMethod -Uri "$base/islemler/$saleId/payment" -Method Patch -Headers @{ Authorization = "Bearer $token" } -Body (@{ paid = $false } | ConvertTo-Json) -ContentType 'application/json'
Write-Host "PAYMENT TOGGLED PAID: $($toggle.paid)"

$finalPerson = Invoke-RestMethod -Uri "$base/kisiler" -Headers @{ Authorization = "Bearer $token" } | Where-Object { $_.id -eq $newPerson.id }
Write-Host "FINAL PERSON: $($finalPerson | ConvertTo-Json -Compress)"
Write-Host "FINAL BALANCE: $($finalPerson.balance)"
