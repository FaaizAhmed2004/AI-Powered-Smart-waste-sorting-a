# Modal Deployment Helper for PowerShell
# Usage: . .\modal_deploy.ps1

function Show-Banner {
    Write-Host @"
╔═══════════════════════════════════════════╗
║   🚀 Modal Deployment Helper             ║
║   Waste Classification API               ║
╚═══════════════════════════════════════════╝
"@ -ForegroundColor Cyan
}

function Test-ModalInstalled {
    $installed = modal --version 2>&1 | Select-String "modal"
    if ($null -eq $installed) {
        Write-Host "❌ Modal CLI not found" -ForegroundColor Red
        Write-Host "Installing Modal..." -ForegroundColor Yellow
        pip install modal
        
        $check = modal --version 2>&1 | Select-String "modal"
        if ($null -eq $check) {
            Write-Host "❌ Failed to install Modal" -ForegroundColor Red
            return $false
        }
        Write-Host "✅ Modal installed successfully" -ForegroundColor Green
    } else {
        Write-Host "✅ Modal CLI found: $installed" -ForegroundColor Green
    }
    return $true
}

function Test-ModalAuth {
    $auth = modal token check 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Not authenticated with Modal" -ForegroundColor Red
        Write-Host "Running authentication..." -ForegroundColor Yellow
        modal token new
        
        $auth = modal token check 2>&1
        if ($LASTEXITCODE -ne 0) {
            Write-Host "❌ Authentication failed" -ForegroundColor Red
            return $false
        }
    }
    Write-Host "✅ Modal authentication confirmed" -ForegroundColor Green
    return $true
}

function Test-ModelFile {
    if (Test-Path "waste_detector.pt") {
        Write-Host "✅ Model file (waste_detector.pt) found" -ForegroundColor Green
        return $true
    } else {
        Write-Host "⚠️  Model file (waste_detector.pt) not found" -ForegroundColor Yellow
        Write-Host "   Will use mock detection or download at runtime" -ForegroundColor Gray
        return $false
    }
}

function Show-DeploymentOptions {
    Write-Host "`n📦 Deployment Options:`n" -ForegroundColor Cyan
    Write-Host "1) Simple Version (Recommended)" -ForegroundColor White
    Write-Host "   • Deploys in 20-30 seconds" -ForegroundColor Gray
    Write-Host "   • Mock detection (no model needed)" -ForegroundColor Gray
    Write-Host "   • Perfect for testing" -ForegroundColor Gray
    Write-Host ""
    Write-Host "2) Full Version (Production)" -ForegroundColor White
    Write-Host "   • Real YOLO predictions" -ForegroundColor Gray
    Write-Host "   • Requires waste_detector.pt" -ForegroundColor Gray
    Write-Host "   • More resource intensive" -ForegroundColor Gray
    Write-Host ""
    Write-Host "3) Run Locally (Test Only)" -ForegroundColor White
    Write-Host "   • Don't deploy to Modal" -ForegroundColor Gray
    Write-Host "   • Just test locally" -ForegroundColor Gray
    Write-Host ""
}

function Deploy-App {
    param(
        [int]$Option
    )
    
    switch ($Option) {
        1 {
            Write-Host "`n🚀 Deploying Simple Version..." -ForegroundColor Yellow
            modal deploy modal_app_simple.py
            Write-Host "`n✅ Deployment initiated!" -ForegroundColor Green
            Write-Host "Monitor your deployment at: https://dashboard.modal.com" -ForegroundColor Cyan
        }
        2 {
            Write-Host "`n🚀 Deploying Full Version..." -ForegroundColor Yellow
            if (-not (Test-ModelFile)) {
                Write-Host "`n⚠️  Model file not found! Continue anyway?" -ForegroundColor Yellow
                $response = Read-Host "Type 'yes' to continue"
                if ($response -ne "yes") {
                    Write-Host "Deployment cancelled" -ForegroundColor Red
                    return
                }
            }
            modal deploy modal_app.py
            Write-Host "`n✅ Deployment initiated!" -ForegroundColor Green
            Write-Host "Monitor your deployment at: https://dashboard.modal.com" -ForegroundColor Cyan
        }
        3 {
            Write-Host "`n🧪 Running Locally..." -ForegroundColor Yellow
            modal run modal_app_simple.py
        }
        default {
            Write-Host "❌ Invalid option" -ForegroundColor Red
        }
    }
}

function Show-NextSteps {
    Write-Host @"

📋 Next Steps:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. Wait for deployment to complete
2. Copy the deployment URL
3. Update your frontend API_BASE_URL
4. Test the endpoint: python modal_test.py <URL>

Useful Commands:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
modal list              # View all deployments
modal logs waste-*      # View logs
modal app stop waste-*  # Stop an app
modal app delete waste-* # Delete an app

📊 Monitor at: https://dashboard.modal.com
"@ -ForegroundColor Cyan
}

# Main Script
function Main {
    Show-Banner
    
    # Check prerequisites
    if (-not (Test-ModalInstalled)) {
        return
    }
    
    if (-not (Test-ModalAuth)) {
        return
    }
    
    Write-Host ""
    Test-ModelFile
    
    Show-DeploymentOptions
    
    $choice = Read-Host "Select option (1-3)"
    
    if ($choice -match "^[1-3]$") {
        Deploy-App ([int]$choice)
        Show-NextSteps
    } else {
        Write-Host "`n❌ Invalid selection" -ForegroundColor Red
    }
}

# Run main function
Main
